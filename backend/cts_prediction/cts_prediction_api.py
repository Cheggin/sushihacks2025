"""
Simple Carpal Tunnel Syndrome Severity Prediction API

A minimal FastAPI that takes patient data and returns CTS severity predictions.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict
import joblib
import pandas as pd
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app will be initialized after lifespan is defined

# Global model storage
model_data = None

class PatientData(BaseModel):
    """Patient data model for predictions"""
    age: int = Field(..., ge=18, le=100, description="Patient age in years")
    bmi: float = Field(..., ge=15.0, le=50.0, description="Body Mass Index")
    sex: int = Field(..., ge=0, le=1, description="Sex (0=female, 1=male)")
    duration: int = Field(..., ge=1, le=120, description="Symptom duration in months")
    nrs: int = Field(..., ge=0, le=10, description="Numeric Rating Scale for pain (0-10)")
    grip_strength: float = Field(..., ge=1.0, le=60.0, description="Grip strength in kg")
    pinch_strength: float = Field(..., ge=0.5, le=15.0, description="Pinch strength in kg")

class PredictionResponse(BaseModel):
    """Response model for predictions"""
    predicted_class: str
    predicted_class_numeric: int
    probabilities: Dict[str, float]
    confidence: float

def load_model():
    """Load the trained model and metadata"""
    global model_data
    if model_data is None:
        try:
            model_path = Path("carpal_tunnel_rf_model.joblib")
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            model_data = joblib.load(model_path)
            logger.info(f"Model loaded successfully: {model_data['model_type']}")
            logger.info(f"Features: {model_data['feature_names']}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise HTTPException(status_code=500, detail="Failed to load prediction model")
    
    return model_data

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    load_model()
    logger.info("API initialized successfully")
    yield
    # Shutdown (if needed)
    pass

# Update FastAPI app initialization
app = FastAPI(
    title="CTS Severity Prediction API",
    description="Predict carpal tunnel syndrome severity using clinical data",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "CTS Severity Prediction API",
        "version": "1.0.0",
        "endpoint": "/predict - POST with patient data to get severity prediction",
        "docs": "/docs - API documentation"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_severity(patient_data: PatientData):
    """
    Predict carpal tunnel syndrome severity based on patient clinical data
    
    Returns:
    - predicted_class: "mild", "moderate", or "severe"
    - predicted_class_numeric: 0, 1, or 2
    - probabilities: probability for each class
    - confidence: highest probability value
    """
    try:
        model_info = load_model()
        model = model_info['model']
        feature_names = model_info['feature_names']
        target_classes = model_info['target_classes']
        
        # Create DataFrame with patient data
        input_data = pd.DataFrame([{
            'age': patient_data.age,
            'bmi': patient_data.bmi,
            'sex': patient_data.sex,
            'duration': patient_data.duration,
            'nrs': patient_data.nrs,
            'grip_strength': patient_data.grip_strength,
            'pinch_strength': patient_data.pinch_strength
        }])
        
        # Ensure correct column order
        input_data = input_data[feature_names]
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]
        
        # Format response
        prob_dict = {target_classes[i]: float(prob) for i, prob in enumerate(probabilities)}
        predicted_class = target_classes[prediction]
        confidence = float(max(probabilities))
        
        return PredictionResponse(
            predicted_class=predicted_class,
            predicted_class_numeric=int(prediction),
            probabilities=prob_dict,
            confidence=confidence
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        model_info = load_model()
        return {
            "status": "healthy",
            "model_loaded": True,
            "model_type": model_info['model_type']
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "model_loaded": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
