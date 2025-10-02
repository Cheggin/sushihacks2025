"""
Market insight generation using Browser Use SDK and Gemini Flash.
Takes fish market data and generates a comprehensive market analysis.
"""
from browser_use_sdk import BrowserUse
from dotenv import load_dotenv
import os
from pathlib import Path
from typing import List, Dict, Any
import json
try:
    from .models import MarketInsight
except ImportError:
    from models import MarketInsight

# Load .env from parent directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

client = BrowserUse(api_key=os.getenv("BROWSER_USE_API_KEY"))


def market_insight(markets_data: List[Dict[str, Any]]) -> dict:
    """
    Generate market insights from fish market data.

    Args:
        markets_data: List of fish markets from /nearby-with-details endpoint
                      Each market should have: name, rating, address, phone, location

    Returns:
        Dictionary with market analysis including summary, findings, and recommendations
    """
    if not markets_data:
        return {
            "summary": "No fish markets found in the area.",
            "total_markets": 0,
            "average_rating": 0.0,
            "key_findings": [],
            "recommendations": ["Search in a different location or expand search radius."]
        }

    # Prepare market data for the task
    markets_summary = "\n".join([
        f"- {m.get('name', 'Unknown')}: Rating {m.get('rating', 'N/A')}/5, Location: {m.get('address', 'Unknown')}, Phone: {m.get('phone', 'N/A')}"
        for m in markets_data
    ])

    task = client.tasks.create_task(
        task=f"""
        You are a market analyst helping fishermen understand where to sell their catch.
        Analyze the following fish markets in the area and provide insights tailored for fishermen:

        {markets_summary}

        Focus your analysis on factors that matter to fishermen:
        - Market accessibility and proximity
        - Market reputation (based on ratings)
        - Which markets might offer better prices or conditions for sellers
        - Logistics considerations (phone contact availability, location convenience)

        Your analysis should include:
        1. A brief summary of the fish market selling landscape from a fisherman's perspective (2-3 sentences)
        2. Total number of markets available for selling
        3. Average market rating (this indicates buyer trust and market quality)
        4. Key findings (3-5 insights about which markets are best for selling, market competition, accessibility)
        5. Actionable recommendations for fishermen (3-5 specific recommendations on where to sell, when to contact markets, how to maximize profit)

        Provide structured output in the following format:
        {{
            "summary": "string (2-3 sentences overview for fishermen)",
            "total_markets": number,
            "average_rating": number (rounded to 1 decimal),
            "key_findings": ["string focusing on selling opportunities", "string about market quality", ...],
            "recommendations": ["string with actionable advice for fishermen", "string about maximizing profit", ...]
        }}
        """,
        llm="gemini-flash-latest",
        schema=MarketInsight,
    )

    print(f"Market Insight Task ID: {task.id}")

    result = task.complete()

    # Parse the output
    if result.output:
        if isinstance(result.output, str):
            return json.loads(result.output)
        return result.output

    # Fallback if no output
    return {
        "summary": "Unable to generate market insights at this time.",
        "total_markets": len(markets_data),
        "average_rating": 0.0,
        "key_findings": [],
        "recommendations": []
    }


if __name__ == '__main__':
    # Test with sample data
    sample_markets = [
        {
            "name": "Tokyo Fish Market",
            "rating": 4.5,
            "address": "5-2-1 Toyosu, Koto City, Tokyo",
            "phone": "+81-3-1234-5678",
            "location": {"lat": 35.6495, "lng": 139.7854}
        },
        {
            "name": "Tsukiji Outer Market",
            "rating": 4.8,
            "address": "Tsukiji, Chuo City, Tokyo",
            "phone": "+81-3-2345-6789",
            "location": {"lat": 35.6654, "lng": 139.7707}
        },
        {
            "name": "Omicho Market",
            "rating": 4.3,
            "address": "50 Kaminiikawamachi, Kanazawa",
            "phone": "+81-76-231-1462",
            "location": {"lat": 36.5617, "lng": 136.6572}
        }
    ]

    insights = market_insight(sample_markets)
    print("\nMarket Insights:")
    print(json.dumps(insights, indent=2))
