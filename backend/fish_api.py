from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class CTSData(BaseModel):
    severity: str
    gripStrength: float
    pinchStrength: float

class ChatRequest(BaseModel):
    messages: list[Message]
    ctsData: Optional[CTSData] = None

@app.get("/")
async def root():
    return {
        "message": "AI Fishing Assistant API",
        "version": "1.0.0",
        "status": "online"
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Chat endpoint for AI fishing assistant.
    Accepts conversation history and optional CTS health data.
    Returns AI-generated response using Gemini API.
    """
    try:
        # Get API key from environment
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="GEMINI_API_KEY environment variable not set"
            )

        # Configure Gemini API
        genai.configure(api_key=api_key)

        # Build system prompt
        system_prompt = """You are a helpful AI fishing assistant for fishermen and maritime workers.
You provide advice on:
- Fish handling techniques and best practices
- Fishing conditions, weather, and optimal timing
- How health conditions (especially carpal tunnel syndrome) affect fishing activities
- Fish species recommendations based on physical abilities
- Sustainable fishing practices
- Equipment and ergonomic recommendations
- Market trends and pricing guidance

Be concise, practical, and safety-focused. Tailor your advice to the user's health condition when provided."""

        # Add CTS context if available
        if request.ctsData:
            system_prompt += f"""

IMPORTANT HEALTH CONTEXT:
The user has {request.ctsData.severity} carpal tunnel syndrome (CTS).
- Current grip strength: {request.ctsData.gripStrength:.1f} kg
- Current pinch strength: {request.ctsData.pinchStrength:.1f} kg

Always consider this when making fishing recommendations. Suggest:
- Lighter fish species for severe CTS
- Ergonomic equipment and proper hand positioning
- Taking breaks to prevent worsening symptoms
- Partner assistance for heavy catches if needed"""

        # Initialize Gemini model
        model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
            system_instruction=system_prompt
        )

        # Convert messages to Gemini format (history excludes last user message)
        chat_history = []
        for msg in request.messages[:-1]:  # Exclude the last user message
            chat_history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content]
            })

        # Start chat with history
        chat = model.start_chat(history=chat_history)

        # Send the latest user message
        last_message = request.messages[-1].content
        response = chat.send_message(last_message)

        return {"response": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
