from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from pathlib import Path
import sys
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Add fish_market directory to path to import fish_ranking
sys.path.append(str(Path(__file__).parent / "fish_market"))
from fish_ranking import fish_ranking

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
FISH_DATA_PATH = Path(__file__).parent / "occurrence_parsed.csv"
fish_df = None

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('models/gemini-2.5-flash')
else:
    gemini_model = None

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

@app.get("/")
async def root():
    return {
        "message": "Fish Occurrence API",
        "version": "1.0.0",
        "records": len(fish_df) if fish_df is not None else 0
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


class FishRankingRequest(BaseModel):
    fish_list: List[str]


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)