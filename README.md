# CARP - Comprehensive Aquatic Research Platform

A full-stack application combining marine biology data visualization with occupational health monitoring for fishermen and maritime workers.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd sushihacks2025

# Start all services (frontend + all backend APIs)
./run.sh
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Fish Occurrence API**: http://localhost:8000/docs
- **Fish Markets API**: http://localhost:8001/docs
- **CTS Prediction API**: http://localhost:8002/docs
- **Sensor Demo API**: http://localhost:8004/docs

Press `Ctrl+C` to stop all services.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python 3.8+**
- **npm** or **yarn**

## 🛠️ Manual Setup

If you prefer to run services individually:

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend APIs
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start individual APIs
python3 fish_api.py                              # Port 8000
python3 fish_market/places_api.py               # Port 8001
python3 cts_prediction/cts_prediction_api.py    # Port 8002
python3 sensor_api/demo_sensor_api.py           # Port 8004
```

## 🎯 Features

### Dashboard
- Real-time fish catch analytics
- Weather conditions and fishing score
- CTS health monitoring
- AI-powered recommendations

### Markets
- Google Places integration for fish markets
- Location-based market search
- AI calling assistant for reservations

### Health
- Carpal Tunnel Syndrome risk assessment
- Live sensor data from Arduino devices
- ML-powered severity prediction
- Historical health tracking

### Globe Visualization
- Interactive 3D globe with 50K+ fish occurrences
- Filter by species, location, and type
- Real-time data from marine databases

## 📂 Project Structure

```
/
├── frontend/           # React + Vite + Convex
│   ├── src/
│   │   ├── pages/     # Main application pages
│   │   └── components/ # Reusable components
│   └── convex/        # Backend functions and schema
│
├── backend/           # Python FastAPI services
│   ├── fish_api.py
│   ├── fish_market/
│   ├── cts_prediction/
│   └── sensor_api/
│
├── run.sh            # Start all services
└── logs/             # Service logs (auto-generated)
```

## 🔧 Development

Logs are automatically saved to `./logs/` when using `run.sh`:
- `fish_api.log` - Fish occurrence data API
- `markets_api.log` - Google Places integration
- `cts_api.log` - Health prediction ML model
- `sensor_api.log` - Sensor data simulation

## 📚 Documentation

For detailed architecture and development guidelines, see [CLAUDE.md](./CLAUDE.md).

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Find and kill process on port (example for 8000)
lsof -ti:8000 | xargs kill -9
```

**Dependencies not installing?**
```bash
# Frontend
cd frontend && rm -rf node_modules && npm install

# Backend
cd backend && pip install --upgrade -r requirements.txt
```

**Services not starting?**
- Check that all prerequisites are installed
- Ensure no other services are using ports 5173, 8000-8004
- Check logs in `./logs/` directory for errors

## 🤝 Contributing

Built for SushiHacks 2025 - Marine biology and medical technology integration.
