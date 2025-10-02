from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from pathlib import Path
import sys
import asyncio
import httpx
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Add fish_market directory to path to import fish_ranking and market_insight
sys.path.append(str(Path(__file__).parent / "fish_market"))
from fish_ranking import fish_ranking
from market_insight import market_insight

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load fish data once at startup
FISH_DATA_PATH = Path(__file__).parent / "data" / "occurrence_parsed.csv"
fish_df = None

# Google Maps API configuration
MAPS_BASE = "https://maps.googleapis.com/maps/api/place"
maps_client: httpx.AsyncClient | None = None

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('models/gemini-2.5-flash')
else:
    gemini_model = None


# ─── Pydantic Models for Places API ───────
class LatLng(BaseModel):
    lat: float
    lng: float


class PlaceSummary(BaseModel):
    name: Optional[str]
    rating: Optional[float]
    address: Optional[str]
    place_id: Optional[str]
    location: Optional[LatLng]
    phone: Optional[str] = None


class NearbyResponse(BaseModel):
    results: List[PlaceSummary]


class FishRankingRequest(BaseModel):
    fish_list: List[str]


# Chat models
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    ctsData: Optional[dict] = None


class ChatResponse(BaseModel):
    response: str


@app.on_event("startup")
async def load_data():
    global fish_df
    try:
        fish_df = pd.read_csv(FISH_DATA_PATH)
        # Filter to only fish classes
        fish_classes = ['Actinopteri', 'Actinopterygii', 'Elasmobranchii', 'Myxini', 'Cephalaspidomorphi']
        fish_df = fish_df[fish_df['class'].isin(fish_classes)]
        print(f"Loaded {len(fish_df)} fish occurrence records")
    except Exception as e:
        print(f"Error loading fish data: {e}")
        fish_df = pd.DataFrame()


@app.on_event("startup")
async def startup_maps_client():
    global maps_client
    maps_client = httpx.AsyncClient(timeout=15.0)
    print("Google Maps API client initialized")


@app.on_event("shutdown")
async def shutdown_maps_client():
    global maps_client
    if maps_client:
        await maps_client.aclose()
        print("Google Maps API client closed")


# ─── Helper Function for Google Maps API ───────
async def _get_json(path: str, params: dict) -> dict:
    """Make authenticated request to Google Maps API"""
    assert maps_client
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_MAPS_API_KEY not configured")

    resp = await maps_client.get(f"{MAPS_BASE}/{path}", params={**params, "key": api_key})
    data = resp.json()
    status = data.get("status")
    if status not in ("OK", "ZERO_RESULTS"):
        raise HTTPException(status_code=502, detail=f"Google error: {status} - {data.get('error_message')}")
    return data


@app.get("/")
async def root():
    return {
        "message": "Fish Occurrence & Places API",
        "version": "2.0.0",
        "endpoints": {
            "fish_data": {
                "GET /fish-occurrences": "Get fish occurrence data with filters",
                "GET /fish-species": "Get list of unique fish species",
                "GET /fish-stats": "Get statistics about fish dataset",
                "POST /fish-ranking": "Rank fish based on freshness, season, and difficulty"
            },
            "google_places": {
                "GET /nearby": "Find places near coordinates",
                "GET /place-details/{place_id}": "Get detailed place information",
                "GET /nearby-with-details": "Find places with phone numbers (slower)"
            },
            "market_analysis": {
                "POST /market-insight": "Generate AI-powered market insights from fish market data"
            },
            "ai_chat": {
                "POST /chat": "AI fishing assistant chatbot"
            }
        },
        "fish_records": len(fish_df) if fish_df is not None else 0
    }

@app.get("/fish-occurrences")
async def get_fish_occurrences(
    type: Optional[str] = Query(None, description="Fish type filter"),
    limit: Optional[int] = Query(1000, description="Maximum number of records to return"),
    country: Optional[str] = Query(None, description="Filter by country"),
    min_depth: Optional[float] = Query(None, description="Minimum depth in meters"),
    max_depth: Optional[float] = Query(None, description="Maximum depth in meters"),
):
    """
    Get fish occurrence data with optional filters.

    Fish types:
    - All Fish
    - Tuna (Thunnus)
    - Skipjack (Katsuwonus pelamis)
    - Yellowfin (Thunnus albacares)
    - Albacore (Thunnus alalunga)
    - Japanese Eel (Anguilla japonica)
    - Lanternfish (Myctophidae)
    """
    if fish_df is None or len(fish_df) == 0:
        raise HTTPException(status_code=500, detail="Fish data not loaded")

    try:
        # Start with all fish data
        filtered_df = fish_df.copy()

        # Apply type filter
        if type and type != "All Fish":
            if "Thunnus" in type and type == "Tuna (Thunnus)":
                # All tuna species
                filtered_df = filtered_df[
                    (filtered_df['genus'] == 'Thunnus') |
                    (filtered_df['family'] == 'Scombridae')
                ]
            elif "Katsuwonus pelamis" in type:
                filtered_df = filtered_df[filtered_df['scientificName'] == 'Katsuwonus pelamis']
            elif "Thunnus albacares" in type:
                filtered_df = filtered_df[filtered_df['scientificName'] == 'Thunnus albacares']
            elif "Thunnus alalunga" in type:
                filtered_df = filtered_df[filtered_df['scientificName'] == 'Thunnus alalunga']
            elif "Anguilla japonica" in type:
                filtered_df = filtered_df[filtered_df['scientificName'] == 'Anguilla japonica']
            elif "Myctophidae" in type:
                filtered_df = filtered_df[filtered_df['family'] == 'Myctophidae']

        # Apply country filter
        if country:
            filtered_df = filtered_df[filtered_df['country'] == country]

        # Apply depth filters
        if min_depth is not None:
            filtered_df = filtered_df[filtered_df['minimumDepthInMeters'] >= min_depth]
        if max_depth is not None:
            filtered_df = filtered_df[filtered_df['maximumDepthInMeters'] <= max_depth]

        # Remove rows without coordinates
        filtered_df = filtered_df.dropna(subset=['decimalLatitude', 'decimalLongitude'])

        # Limit results
        filtered_df = filtered_df.head(limit)

        # Convert to list of dicts
        records = filtered_df[[
            'id', 'catalogNumber', 'scientificName', 'family', 'order', 'genus',
            'decimalLatitude', 'decimalLongitude', 'country', 'eventDate',
            'year', 'minimumDepthInMeters', 'maximumDepthInMeters', 'occurrenceStatus'
        ]].to_dict('records')

        return {
            "count": len(records),
            "filter": type or "All Fish",
            "data": records
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/fish-species")
async def get_fish_species():
    """Get list of unique fish species in the dataset"""
    if fish_df is None or len(fish_df) == 0:
        raise HTTPException(status_code=500, detail="Fish data not loaded")

    species = fish_df['scientificName'].value_counts().head(50).to_dict()
    return {"species": species}

@app.get("/fish-stats")
async def get_fish_stats():
    """Get statistics about the fish dataset"""
    if fish_df is None or len(fish_df) == 0:
        raise HTTPException(status_code=500, detail="Fish data not loaded")

    stats = {
        "total_records": len(fish_df),
        "unique_species": fish_df['scientificName'].nunique(),
        "countries": fish_df['country'].value_counts().to_dict(),
        "top_families": fish_df['family'].value_counts().head(10).to_dict(),
        "top_species": fish_df['scientificName'].value_counts().head(10).to_dict(),
        "date_range": {
            "min_year": int(fish_df['year'].min()) if pd.notna(fish_df['year'].min()) else None,
            "max_year": int(fish_df['year'].max()) if pd.notna(fish_df['year'].max()) else None,
        },
        "depth_range": {
            "min": float(fish_df['minimumDepthInMeters'].min()) if pd.notna(fish_df['minimumDepthInMeters'].min()) else None,
            "max": float(fish_df['maximumDepthInMeters'].max()) if pd.notna(fish_df['maximumDepthInMeters'].max()) else None,
        }
    }

    return stats


@app.post("/fish-ranking")
async def rank_fish(request: FishRankingRequest):
    """
    Rank fish based on cleaning difficulty, commonality, peak season, and edibility.

    Input: List of scientific fish names
    Output: Dictionary with rankings and metadata for each fish

    Example:
    POST /fish-ranking
    {
        "fish_list": ["Thunnus albacares", "Fragum scruposum"]
    }
    """
    if not request.fish_list:
        raise HTTPException(status_code=400, detail="fish_list cannot be empty")

    try:
        result = fish_ranking(request.fish_list)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"Fish classification data not found: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ranking fish: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """AI chatbot endpoint for fishing assistance"""
    if not gemini_model:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY environment variable is not set")

    try:
        # Build context with CTS data if available
        system_context = """You are an AI fishing assistant helping fishermen and maritime workers.
You provide advice on:
- Fish handling techniques and best practices
- Optimal fishing conditions based on weather and location
- Health considerations for fishermen (especially repetitive strain injuries like Carpal Tunnel Syndrome)
- Equipment recommendations
- Safety guidelines

Be concise, practical, and always prioritize safety. Use a friendly, helpful tone."""

        if request.ctsData:
            cts_severity = request.ctsData.get('severity', 'Unknown')
            grip_strength = request.ctsData.get('gripStrength', 0)
            pinch_strength = request.ctsData.get('pinchStrength', 0)

            system_context += f"\n\nCurrent user health data:"
            system_context += f"\n- CTS Risk Level: {cts_severity}"
            system_context += f"\n- Grip Strength: {grip_strength:.1f} kg"
            system_context += f"\n- Pinch Strength: {pinch_strength:.1f} kg"
            system_context += "\n\nConsider this health information when providing advice about fishing techniques and equipment."

        # Convert messages to Gemini format
        conversation_history = []
        for msg in request.messages:
            conversation_history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content]
            })

        # Start chat with history
        chat = gemini_model.start_chat(history=conversation_history[:-1])

        # Get the last user message
        last_message = conversation_history[-1]["parts"][0]

        # Send message with system context prepended to first message
        full_prompt = f"{system_context}\n\nUser: {last_message}" if len(conversation_history) == 1 else last_message
        response = chat.send_message(full_prompt)

        return ChatResponse(response=response.text)

    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Google Places API Endpoints ───────

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


class MarketInsightRequest(BaseModel):
    markets: List[dict]


@app.post("/market-insight")
async def get_market_insight(request: MarketInsightRequest):
    """
    Generate market insights from fish market data.

    Input: List of markets (typically from /nearby-with-details)
    Output: Comprehensive market analysis with summary, findings, and recommendations

    Example:
    POST /market-insight
    {
        "markets": [
            {
                "name": "Tokyo Fish Market",
                "rating": 4.5,
                "address": "5-2-1 Toyosu, Koto City, Tokyo",
                "phone": "+81-3-1234-5678",
                "location": {"lat": 35.6495, "lng": 139.7854}
            }
        ]
    }
    """
    if not request.markets:
        raise HTTPException(status_code=400, detail="markets list cannot be empty")

    try:
        insights = market_insight(request.markets)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating market insights: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
