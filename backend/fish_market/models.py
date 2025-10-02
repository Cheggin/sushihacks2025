from pydantic import BaseModel
from typing import List


class MarketInsight(BaseModel):
    """Schema for market insight output"""
    summary: str
    total_markets: int
    average_rating: float
    key_findings: List[str]
    recommendations: List[str]
