import os
from dotenv import load_dotenv
from browser_use_sdk import BrowserUse
from pydantic import BaseModel
from typing import List

load_dotenv()

client = BrowserUse(api_key=os.getenv("BROWSER_USE_API_KEY"))

class Market(BaseModel):
    name: str
    address: str
    phone_number: str

class FishMarkets(BaseModel):
    markets: List[Market]

def find_fish_markets(location: str) -> dict:
    task = client.tasks.create_task(
        task=f"""
        Can you search up 'fish markets in {location}' in google maps and provide a structured output of:
        {{
            markets: [
                {{
                    name: string,
                    address: string,
                    phone_number: string,
                }}
            ]

        }}
        """,
        llm="gemini-flash-latest",
        schema=FishMarkets,
    )

    print(f"Task ID: {task.id}")

    result = task.complete()

    if result.parsed_output is not None:
        return {
            "markets": [
                {
                    "name": market.name,
                    "address": market.address,
                    "phone_number": market.phone_number
                }
                for market in result.parsed_output.markets
            ]
        }
    else:
        return {
            "markets": [],
            "error": f"Unable to find fish markets in {location} due to technical issues."
        }

def main():
    # Test the function
    location = "San Francisco, CA 94108"
    result = find_fish_markets(location)
    print(f"Fish markets in {location}:")
    for market in result.get('markets', []):
        print(f"\nName: {market['name']}")
        print(f"Address: {market['address']}")
        print(f"Phone: {market['phone_number']}")

if __name__ == '__main__':
    main()
