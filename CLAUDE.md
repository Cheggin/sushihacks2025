# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend Development
```bash
cd frontend
npm install                # Install dependencies
npm run dev                # Start both frontend (Vite) and Convex backend
npm run dev:frontend       # Start only frontend dev server (port 5173)
npm run dev:backend        # Start only Convex backend
npm run build             # Build for production
npm run lint              # Run ESLint checks
npm run preview           # Preview production build
```

### Backend Development
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start individual APIs
python3 fish_api.py                                    # Fish Occurrence API (port 8000)
python3 cts_prediction/cts_prediction_api.py          # CTS Prediction API (port 8002)
python3 sensor_api/sensor_api.py                      # Real Arduino Sensor API (port 8003)
python3 sensor_api/demo_sensor_api.py                 # Demo Sensor API (port 8004)

# Run tests
python3 cts_prediction/test_api_works.py              # Test CTS prediction API
```

## Architecture

This is a full-stack application combining marine biology data visualization with occupational health monitoring for fishermen and maritime workers.

### Technology Stack
- **Frontend**: React 19 + TypeScript, Vite, React Router, Tailwind CSS, Recharts, Leaflet maps
- **Backend**: FastAPI (Python), scikit-learn for ML, Pandas for data processing
- **Real-time Backend**: Convex for database and real-time sync
- **Hardware Integration**: Arduino sensors via Bleak (Bluetooth Low Energy)

### Project Structure
```
/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── pages/           # Main application pages (Landing, HomePage, Health, FishMapPage)
│   │   ├── components/      # Reusable components (Navbar, FishMap, Layout)
│   │   └── utils/           # Utilities (fishZoneAnalyzer.ts)
│   └── convex/              # Convex backend functions
│       ├── myFunctions.ts   # Database queries and mutations
│       └── schema.ts        # Database schema definitions
│
└── backend/                 # Python FastAPI services
    ├── fish_api.py          # Fish occurrence data API
    ├── cts_prediction/      # ML-based CTS severity prediction
    │   ├── cts_prediction_api.py
    │   └── carpal_tunnel_rf_model.joblib
    ├── sensor_api/          # Arduino sensor integration
    │   ├── sensor_api.py    # Real hardware connection
    │   └── demo_sensor_api.py  # Hardware simulation
    └── data/                # Data files
        └── occurrence_parsed.csv  # 50K+ fish occurrence records
```

### API Endpoints and Ports
- **Port 8000**: Fish Occurrence API - `GET /fish-occurrences` (filters by species, location, depth)
- **Port 8002**: CTS Prediction API - `POST /predict` (7 clinical inputs → severity classification)
- **Port 8003**: Real Sensor API - Connects to Arduino BLE sensors for grip/pinch strength
- **Port 8004**: Demo Sensor API - Simulated sensor data for development

### Frontend Routing
- `/` - Landing page
- `/homepage` - Main dashboard
- `/map` - Interactive fish occurrence map (Leaflet)
- `/health` - Health monitoring with CTS prediction

### Key Data Flow
1. **Fish Data**: Backend reads occurrence_parsed.csv → API serves filtered data → Frontend displays on Leaflet map
2. **Health Monitoring**: User inputs clinical data → Backend ML model predicts CTS severity → Frontend displays results with Recharts
3. **Sensor Data**: Arduino sensors → Bluetooth → Backend API → Real-time updates to frontend
4. **Convex Integration**: Frontend components → Convex functions → Real-time database sync

### ML Model Details
- **Model**: Random Forest classifier (carpal_tunnel_rf_model.joblib)
- **Inputs**: age, BMI, sex, duration, pain_scale, grip_strength, pinch_strength
- **Output**: CTS severity (mild/moderate/severe) with confidence scores

### Development Notes
- Frontend uses Axios for HTTP requests to backend APIs
- Tailwind CSS with custom blue gradient theme (`from-[#1d3f8b] via-[#2b6cb0] to-[#2563eb]`)
- Convex provides real-time database capabilities without manual WebSocket setup
- Fish occurrence data contains 50K+ records from marine biology databases