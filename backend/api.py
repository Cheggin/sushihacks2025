from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

class FeatureRequest(BaseModel):
    features: List[float]

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    metadata: Dict[str, Any]

@app.post("/feature_predict", response_model=PredictionResponse)
async def feature_predict(request: FeatureRequest):
    try:
        # Simple prediction logic - replace with your ML model
        prediction_value = sum(request.features) / len(request.features) if request.features else 0.0
        confidence_score = min(1.0, len(request.features) / 10.0)

        return PredictionResponse(
            prediction=prediction_value,
            confidence=confidence_score,
            metadata={
                "feature_count": len(request.features),
                "model_version": "1.0.0"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Feature Prediction API", "version": "1.0.0"}