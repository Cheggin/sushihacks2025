from __future__ import annotations
import asyncio
from typing import List, Optional

import httpx
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

API_KEY = "AIzaSyATipNxk3Li_Calo33M3nwKJnYSfYQlHWM"  # or load from .env
MAPS_BASE = "https://maps.googleapis.com/maps/api/place"

app = FastAPI()

# Enable CORS if you’re calling from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client: httpx.AsyncClient | None = None

@app.on_event("startup")
async def startup():
    global client
    client = httpx.AsyncClient(timeout=15.0)

@app.on_event("shutdown")
async def shutdown():
    global client
    if client:
        await client.aclose()


# ─── Models ────────────────────────────────
class LatLng(BaseModel):
    lat: float
    lng: float

class PlaceSummary(BaseModel):
    name: Optional[str]
    rating: Optional[float]
    address: Optional[str]
    place_id: Optional[str]
    location: Optional[LatLng]
    phone: Optional[str] = None  # Added phone field

class NearbyResponse(BaseModel):
    results: List[PlaceSummary]


# ─── Helper ────────────────────────────────
async def _get_json(path: str, params: dict) -> dict:
    assert client
    resp = await client.get(f"{MAPS_BASE}/{path}", params={**params, "key": API_KEY})
    data = resp.json()
    status = data.get("status")
    if status not in ("OK", "ZERO_RESULTS"):
        raise HTTPException(status_code=502, detail=f"Google error: {status} - {data.get('error_message')}")
    return data


# ─── Endpoint: Nearby by coordinates ───────
@app.get("/nearby", response_model=NearbyResponse)
async def nearby(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius: int = Query(1500, ge=1, le=50000),
    type: Optional[str] = Query(None, description="e.g., cafe, restaurant, pharmacy"),
    keyword: Optional[str] = Query(None, description="e.g., ramen, matcha"),
    pages: int = Query(1, ge=1, le=3),
):
    """
    Find places near the given coordinates.
    Example: /nearby?lat=32.88&lng=-117.23&type=cafe&radius=2000
    """
    params = {"location": f"{lat},{lng}", "radius": radius}
    if type: params["type"] = type
    if keyword: params["keyword"] = keyword

    results: list[dict] = []
    data = await _get_json("nearbysearch/json", params)
    results.extend(data.get("results", []))

    # Handle pagination if requested
    token = data.get("next_page_token")
    page_count = 1
    while token and page_count < pages:
        await asyncio.sleep(2)  # wait for token activation
        data = await _get_json("nearbysearch/json", {"pagetoken": token})
        results.extend(data.get("results", []))
        token = data.get("next_page_token")
        page_count += 1

    # Trim to a simple shape
    simplified = []
    for r in results:
        loc = r.get("geometry", {}).get("location", {})
        simplified.append(
            PlaceSummary(
                name=r.get("name"),
                rating=r.get("rating"),
                address=r.get("vicinity") or r.get("formatted_address"),
                place_id=r.get("place_id"),
                location=LatLng(lat=loc.get("lat"), lng=loc.get("lng")) if loc else None,
            )
        )
    return NearbyResponse(results=simplified)


# ─── Endpoint: Get place details with phone ───────
@app.get("/place-details/{place_id}")
async def get_place_details(place_id: str):
    """
    Get detailed info about a place including phone number.
    Example: /place-details/ChIJlVzTQeCJGGARBJBnw8Oku6M
    """
    params = {
        "place_id": place_id,
        "fields": "name,rating,formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,geometry"
    }

    data = await _get_json("details/json", params)
    result = data.get("result", {})

    loc = result.get("geometry", {}).get("location", {})

    return {
        "name": result.get("name"),
        "rating": result.get("rating"),
        "address": result.get("formatted_address"),
        "phone": result.get("formatted_phone_number"),
        "international_phone": result.get("international_phone_number"),
        "website": result.get("website"),
        "opening_hours": result.get("opening_hours", {}).get("weekday_text"),
        "location": {"lat": loc.get("lat"), "lng": loc.get("lng")} if loc else None,
        "place_id": place_id
    }


# ─── Endpoint: Nearby with phone numbers (slower) ───────
@app.get("/nearby-with-details", response_model=NearbyResponse)
async def nearby_with_details(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius: int = Query(1500, ge=1, le=50000),
    keyword: Optional[str] = Query(None, description="e.g., fish market"),
    limit: int = Query(5, ge=1, le=20, description="Max results to fetch details for")
):
    """
    Find places near coordinates WITH phone numbers (slower, costs more API calls).
    Limited to prevent too many API calls.
    Example: /nearby-with-details?lat=35.6762&lng=139.6503&keyword=fish+market&limit=5
    """
    # First get nearby places
    params = {"location": f"{lat},{lng}", "radius": radius}
    if keyword: params["keyword"] = keyword

    data = await _get_json("nearbysearch/json", params)
    places = data.get("results", [])[:limit]  # Limit results

    # Fetch details for each place (includes phone)
    detailed_results = []
    for place in places:
        place_id = place.get("place_id")
        if not place_id:
            continue

        # Get detailed info
        details_params = {
            "place_id": place_id,
            "fields": "formatted_phone_number"
        }

        try:
            details_data = await _get_json("details/json", details_params)
            phone = details_data.get("result", {}).get("formatted_phone_number")
        except:
            phone = None

        loc = place.get("geometry", {}).get("location", {})
        detailed_results.append(
            PlaceSummary(
                name=place.get("name"),
                rating=place.get("rating"),
                address=place.get("vicinity") or place.get("formatted_address"),
                place_id=place_id,
                location=LatLng(lat=loc.get("lat"), lng=loc.get("lng")) if loc else None,
                phone=phone
            )
        )

    # Pretty print the results
    print("\n" + "="*60)
    print(f"🐟 Found {len(detailed_results)} fish markets near ({lat:.4f}, {lng:.4f})")
    print("="*60)
    for i, place in enumerate(detailed_results, 1):
        print(f"\n{i}. {place.name}")
        print(f"   📍 {place.address}")
        print(f"   ⭐ Rating: {place.rating if place.rating else 'N/A'}")
        print(f"   📞 Phone: {place.phone if place.phone else 'No phone available'}")
        if place.location:
            print(f"   🗺️  Lat: {place.location.lat:.6f}, Lng: {place.location.lng:.6f}")
    print("="*60 + "\n")

    return NearbyResponse(results=detailed_results)
