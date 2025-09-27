from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

class FeatureRequest(BaseModel):
    age: int
    bmi: float
    csa: float
    pb: float
    nrs: int
    sex: int  # 0=male, 1=female

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    metadata: Dict[str, Any]

@app.post("/feature_predict", response_model=PredictionResponse)
async def feature_predict(request: FeatureRequest):
    """
    json data example:
    {   
        "age": int,
        "bmi": float,
        "csa": float,
        "pb": float,
        "nrs": (int 0-10),
        "sex": (0=male, 1-female)
    }
    """
    try:
        # Convert request fields to list for processing
        features = [request.age, request.bmi, request.csa, request.pb, request.nrs, request.sex]

        # Simple prediction logic - replace with your ML model
        prediction_value = sum(features) / len(features) if features else 0.0
        confidence_score = min(1.0, len(features) / 10.0)

        return PredictionResponse(
            prediction=prediction_value,
            confidence=confidence_score,
            metadata={
                "feature_count": len(features),
                "model_version": "1.0.0"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Feature Prediction API", "version": "1.0.0"}