# CTS Prediction API

This folder contains the complete Carpal Tunnel Syndrome severity prediction system.

## 📁 Contents

- `cts_prediction_api.py` - Main FastAPI server
- `test_api_works.py` - Test client script
- `README.md` - Detailed API documentation
- `carpal_tunnel_rf_model.joblib` - Trained Random Forest model
- `carpal_tunnel_rf_model.pkl` - Model backup (pickle format)

## 🚀 Quick Start

```bash
# From the cts_prediction folder:
cd backend/cts_prediction

# Start the API
python3 cts_prediction_api.py

# Test in another terminal
python3 test_api_works.py
```

## 🔗 API Endpoints

- **Main API**: http://localhost:8002
- **Prediction**: `POST /predict`
- **Health Check**: `GET /health`
- **Documentation**: http://localhost:8002/docs

## 🎯 Model Features

The Random Forest model uses 6 clinical features:
1. Age (18-100 years)
2. BMI (15.0-50.0)
3. Sex (0=female, 1=male)
4. Duration (1-120 months)
5. NRS pain scale (0-10)
6. Grip strength (1.0-60.0 kg)
7. Pinch strength (0.5-15.0 kg)

## 📊 Output Classes

- **0 (mild)**: Mild CTS severity
- **1 (moderate)**: Moderate CTS severity
- **2 (severe)**: Severe CTS severity
