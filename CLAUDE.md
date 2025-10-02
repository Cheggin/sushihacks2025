# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend Development (in `/frontend` directory)
- `npm install` - Install dependencies
- `npm run dev` - Start both Vite frontend dev server and Convex backend in parallel
- `npm run dev:frontend` - Start only the Vite frontend development server
- `npm run dev:backend` - Start only the Convex backend development
- `npm run build` - Build the project for production (TypeScript compilation + Vite build)
- `npm run lint` - Run TypeScript type checking and ESLint
- `npm run preview` - Preview production build locally
- `convex dashboard` - Open the Convex dashboard in browser

### Backend Development (in `/backend` directory)
- `pip install -r requirements.txt` - Install Python dependencies
- `python3 fish_api.py` - Start Fish Occurrence API (port 8000)
- `cd cts_prediction && python3 cts_prediction_api.py` - Start CTS Prediction API (port 8002)
- `cd sensor_api && python3 sensor_api.py` - Start Real Sensor API (port 8003)
- `cd sensor_api && python3 demo_sensor_api.py` - Start Demo Sensor API (port 8004)

## Architecture

This is a full-stack fishery and health monitoring application with **separate frontend and backend** architectures:

### Frontend Stack (`/frontend`)
- **Convex** - Backend database and real-time data (for user profiles, CTS assessments)
- **React 19** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling with glass morphism design
- **Globe.gl** - 3D globe visualization for fish occurrences
- **Recharts** - Charts and data visualization
- **React Router v7** - Not used for routing; navigation handled via popup state

### Backend Stack (`/backend`)
- **FastAPI** - Multiple independent API services
- **Scikit-learn** - ML model for CTS prediction
- **Pandas** - Data processing for fish occurrences
- **Bleak** - Bluetooth Low Energy for Arduino sensors

### Application Features

1. **Dashboard (HomePage)** - Fish catch analytics, weather conditions, fishing score, AI recommendations
2. **Map (MarketsPage)** - Fish market directory with AI calling assistant
3. **Health (HealthPage)** - CTS risk assessment with live sensor data collection and ML prediction
4. **Globe Visualization** - Interactive 3D globe showing 50K+ fish occurrences with filtering

### Key Architectural Patterns

#### Popup-Based Navigation
The app does NOT use traditional routing. Instead:
- `App.tsx` manages `activePopup` state (null, "homepage", "map", or "health")
- Clicking navbar buttons toggles popup visibility with fade/slide animations
- Pages are conditionally rendered based on `activePopup`
- Globe background is always visible behind popups
- Navbar appears in two locations:
  - Inside PageLayout when a popup is active (integrated with page header)
  - Centered at top when no popup is active (floating navbar over globe)

#### Backend Integration
Frontend connects to multiple backend services:
- **Convex** (via ConvexProvider) - User profiles, CTS assessment history
- **Fish API (port 8000)** - Fish occurrence data for globe visualization
- **CTS Prediction API (port 8002)** - ML predictions for carpal tunnel severity
- **Sensor API (port 8003/8004)** - Real-time grip/pinch strength measurements

#### Data Flow: CTS Health Assessment
1. User completes onboarding → saves to Convex `userProfiles` table
2. User takes risk test → collects sensor data via streaming API
3. Frontend sends patient data + sensor averages to CTS Prediction API
4. Prediction result saved to Convex `ctsAssessments` table
5. Dashboard displays historical assessments with charts

### Critical Implementation Details

#### Theme System
- Uses `data-theme` attribute on `document.documentElement` ("color" or "bw")
- CSS variables defined in `@/index.css`: `--card-bg`, `--text-primary`, `--text-secondary`, `--muted`
- Toggle controlled by state in each page component (not centralized)

#### Convex Schema
Two main tables in `/frontend/convex/schema.ts`:
- `userProfiles` - User baseline data (age, BMI, CTS pain duration)
- `ctsAssessments` - Historical risk assessments with predictions

Each has separate Convex files for queries/mutations (`userProfiles.ts`, `ctsAssessments.ts`)

#### Globe Visualization
- `GlobeBackground.tsx` renders 3D globe with `globe.gl`
- Fetches fish data from backend Fish API (port 8000)
- Filters data based on `SearchPanel` filters (fish types, search text)
- Passes filtered/total counts back to App.tsx for display
- User marker shows selected location from Landing page

#### Sensor Data Collection
Health page streams live sensor readings via Server-Sent Events (SSE):
- 7-second countdown before data collection starts
- 10-second collection window with live chart updates
- Supports both real hardware (port 8003) and demo simulation (port 8004)

### File Structure

```
/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Root component with popup navigation
│   │   ├── main.tsx             # Entry point with ConvexProvider
│   │   ├── pages/
│   │   │   ├── HomePage.tsx     # Dashboard with charts and summary
│   │   │   ├── Health.tsx       # CTS assessment workflow
│   │   │   ├── MarketsPage.tsx  # Fish market directory
│   │   │   └── Landing.tsx      # Location picker overlay
│   │   ├── components/
│   │   │   ├── PageLayout.tsx   # Wrapper with navbar and header
│   │   │   ├── GlobeBackground.tsx  # 3D globe visualization
│   │   │   ├── SearchPanel.tsx  # Fish filtering sidebar
│   │   │   ├── FishSidebar.tsx  # Fish details overlay
│   │   │   ├── DashboardSummary.tsx  # Today's summary cards
│   │   │   └── AIAssistant.tsx  # Fishing advice chatbot
│   │   └── types/
│   │       └── fish.ts          # FishOccurrence interface
│   └── convex/
│       ├── schema.ts            # Database schema
│       ├── userProfiles.ts      # User profile queries/mutations
│       └── ctsAssessments.ts    # Assessment queries/mutations
└── backend/
    ├── fish_api.py              # Fish occurrence data API
    ├── cts_prediction/
    │   ├── cts_prediction_api.py  # ML prediction API
    │   └── carpal_tunnel_rf_model.pkl  # Trained model
    └── sensor_api/
        ├── sensor_api.py        # Real Arduino BLE sensors
        └── demo_sensor_api.py   # Simulated sensor data
```

### Import Aliases
- `@/` maps to `/frontend/src` (configured in `vite.config.ts` and `tsconfig.app.json`)

### Port Allocation
- **5173** - Vite frontend dev server
- **8000** - Fish Occurrence API
- **8002** - CTS Prediction API
- **8003** - Real Sensor API
- **8004** - Demo Sensor API

All services can run simultaneously.
