# SushiHacks 2025 Backend APIs

This directory contains multiple API systems for the SushiHacks 2025 project, including carpal tunnel syndrome prediction, sensor data collection, and fish occurrence data.

## 🎯 API Systems Overview

### 🔬 **CTS Prediction API** (`cts_prediction/`)
Predicts carpal tunnel syndrome severity using a Random Forest machine learning model.

- **Port**: 8002
- **Endpoint**: `POST /predict`
- **Features**: Age, BMI, sex, duration, pain scale, grip/pinch strength
- **Output**: Severity classification (mild/moderate/severe) with confidence scores
- **Files**: `cts_prediction_api.py`, model files, test client

### 🐟 **Fish Occurrence API** (`fish_api.py`)
Provides fish occurrence data from marine databases with filtering capabilities.

- **Port**: 8000
- **Endpoint**: `GET /fish-occurrences`
- **Features**: Species filtering, location filtering, depth filtering
- **Data**: 50K+ fish occurrence records from marine databases
- **Output**: Filtered fish occurrence data with coordinates

### 📊 **Sensor Data APIs** (`sensor_api/`)
Real-time sensor data collection from Arduino hardware and simulation.

#### Real Sensor API (`sensor_api.py`)
- **Port**: 8003
- **Hardware**: Arduino BLE sensors
- **Data**: Grip strength, pinch strength, FSR readings
- **Features**: Real-time streaming, device discovery, data collection

#### Demo Sensor API (`demo_sensor_api.py`)
- **Port**: 8004
- **Purpose**: Hardware simulation for development
- **Data**: Realistic simulated sensor readings
- **Features**: No hardware required, matches real sensor patterns

## 🚀 Quick Start

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Start Individual APIs

```bash
# CTS Prediction API (Port 8002)
cd cts_prediction
python3 cts_prediction_api.py

# Fish Occurrence API (Port 8000)
python3 fish_api.py

# Real Sensor API (Port 8003)
cd sensor_api
python3 sensor_api.py

# Demo Sensor API (Port 8004)
cd sensor_api
python3 demo_sensor_api.py
```

## 🔗 API Endpoints Summary

| API | Port | Main Endpoint | Purpose |
|-----|------|---------------|---------|
| CTS Prediction | 8002 | `POST /predict` | Predict CTS severity |
| Fish Occurrence | 8000 | `GET /fish-occurrences` | Get fish data |
| Real Sensor | 8003 | `POST /sensors/collect` | Collect sensor data |
| Demo Sensor | 8004 | `POST /sensors/collect` | Simulate sensor data |

## 📊 Data Models

### CTS Prediction Input
```json
{
  "age": 65,
  "bmi": 23.5,
  "sex": 0,
  "duration": 6,
  "nrs": 7,
  "grip_strength": 13.0,
  "pinch_strength": 2.9
}
```

### Fish Occurrence Response
```json
{
  "count": 1000,
  "filter": "Tuna (Thunnus)",
  "data": [
    {
      "scientificName": "Thunnus albacares",
      "decimalLatitude": 35.5,
      "decimalLongitude": -120.2,
      "country": "United States"
    }
  ]
}
```

### Sensor Data Response
```json
{
  "timestamp": 1696089600.0,
  "fsr_raw": 0,
  "pinch_strength_kg": 7.5,
  "grip_strength_kg": 25.0
}
```

## 🧪 Testing

Each API includes test clients:

```bash
# Test CTS Prediction
cd cts_prediction && python3 test_api_works.py

# Test Fish API
curl "http://localhost:8000/fish-occurrences?limit=10"

# Test Sensor APIs
curl "http://localhost:8003/sensors/discover"  # Real
curl "http://localhost:8004/sensors/info"      # Demo
```

## 📁 Directory Structure

```
backend/
├── README.md                      # This overview file
├── requirements.txt               # Python dependencies
├── cts_prediction/                # CTS prediction system
│   ├── cts_prediction_api.py     # Main API
│   ├── test_api.py               # Test client
│   ├── README_CTS.md             # Detailed docs
│   └── carpal_tunnel_rf_model.*  # Trained models
├── sensor_api/                    # Sensor data collection
│   ├── sensor_api.py             # Real hardware API
│   ├── demo_sensor_api.py        # Simulation API
│   └── README_DEMO.md            # Demo documentation
├── fish_api.py                    # Fish occurrence API
├── test.ipynb                     # Model training notebook
├── occurrence_parsed.csv         # Fish data
└── other data files...
```

## 🔧 Dependencies

- **FastAPI**: Web API framework
- **Uvicorn**: ASGI server
- **Pandas**: Data processing
- **Scikit-learn**: Machine learning
- **Bleak**: Bluetooth Low Energy (sensors)
- **Pydantic**: Data validation
- **Requests**: HTTP client (testing)

## 📚 Documentation

- **CTS Prediction**: `cts_prediction/README_CTS.md`
- **Demo Sensors**: `sensor_api/README_DEMO.md`
- **Interactive Docs**: Available at each API's `/docs` endpoint

## 🎯 Port Allocation

- **8000**: Fish Occurrence API
- **8002**: CTS Prediction API
- **8003**: Real Sensor API
- **8004**: Demo Sensor API

All APIs can run simultaneously without conflicts.

---

🔬 **Built for SushiHacks 2025** - Marine biology and medical technology integration