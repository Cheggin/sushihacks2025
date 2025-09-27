from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

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
        # Initialize risk score and factors
        risk_score = 0.0
        risk_factors = []

        # Age risk factor (higher risk with age)
        age_risk = 0.0
        if request.age < 40:
            age_risk = 0.1
        elif request.age < 50:
            age_risk = 0.2
        elif request.age < 60:
            age_risk = 0.3
        else:
            age_risk = 0.4
            risk_factors.append("Age > 60")
        risk_score += age_risk * 0.15  # 15% weight

        # BMI risk factor (U-shaped risk curve)
        bmi_risk = 0.0
        if request.bmi < 18.5:  # Underweight
            bmi_risk = 0.3
            risk_factors.append("BMI < 18.5 (Underweight)")
        elif 18.5 <= request.bmi <= 24.9:  # Normal
            bmi_risk = 0.1
        elif 25 <= request.bmi <= 29.9:  # Overweight
            bmi_risk = 0.3
            risk_factors.append("BMI 25-30 (Overweight)")
        else:  # Obese
            bmi_risk = 0.5
            risk_factors.append("BMI > 30 (Obese)")
        risk_score += bmi_risk * 0.20  # 20% weight

        # CSA risk factor (Cross-Sectional Area - nerve swelling indicator)
        # Normal median nerve CSA is typically < 10 mm²
        csa_risk = 0.0
        if request.csa < 9:
            csa_risk = 0.1
        elif request.csa < 11:
            csa_risk = 0.3
        elif request.csa < 14:
            csa_risk = 0.5
            risk_factors.append("CSA 11-14 mm² (Moderate swelling)")
        else:
            csa_risk = 0.8
            risk_factors.append("CSA > 14 mm² (Severe swelling)")
        risk_score += csa_risk * 0.25  # 25% weight

        # Palmar Bowing risk factor (nerve displacement)
        # Normal PB is typically < 2.5 mm
        pb_risk = 0.0
        if request.pb < 2.5:
            pb_risk = 0.1
        elif request.pb < 3.5:
            pb_risk = 0.4
            risk_factors.append("PB 2.5-3.5 mm (Mild bowing)")
        elif request.pb < 4.5:
            pb_risk = 0.6
            risk_factors.append("PB 3.5-4.5 mm (Moderate bowing)")
        else:
            pb_risk = 0.8
            risk_factors.append("PB > 4.5 mm (Severe bowing)")
        risk_score += pb_risk * 0.25  # 25% weight

        # NRS pain score risk factor
        nrs_risk = request.nrs / 10.0  # Normalize to 0-1
        if request.nrs >= 7:
            risk_factors.append(f"High pain level (NRS {request.nrs}/10)")
        elif request.nrs >= 4:
            risk_factors.append(f"Moderate pain (NRS {request.nrs}/10)")
        risk_score += nrs_risk * 0.15  # 15% weight

        # Sex risk factor (females have slightly higher CTS risk)
        if request.sex == 1:  # Female
            risk_score += 0.05  # Small additional risk

        # Ensure risk score is between 0 and 1
        prediction_value = min(1.0, max(0.0, risk_score))

        # Calculate confidence based on data completeness and value ranges
        confidence_score = 0.75  # Base confidence

        # Adjust confidence based on measurement validity
        if request.csa > 0 and request.pb > 0:
            confidence_score += 0.10
        if 18.5 <= request.bmi <= 35:  # Reasonable BMI range
            confidence_score += 0.05
        if 0 <= request.nrs <= 10:  # Valid NRS range
            confidence_score += 0.05
        if 18 <= request.age <= 100:  # Reasonable age range
            confidence_score += 0.05

        confidence_score = min(1.0, confidence_score)

        # Determine overall risk level
        if prediction_value < 0.3:
            risk_level = "Low"
        elif prediction_value < 0.6:
            risk_level = "Moderate"
        else:
            risk_level = "High"

        return PredictionResponse(
            prediction=prediction_value,
            confidence=confidence_score,
            metadata={
                "model_version": "2.0.0",
                "risk_level": risk_level,
                "risk_factors": risk_factors if risk_factors else ["No significant risk factors identified"],
                "weights": {
                    "age": "15%",
                    "bmi": "20%",
                    "csa": "25%",
                    "pb": "25%",
                    "nrs": "15%"
                }
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Feature Prediction API", "version": "1.0.0"}