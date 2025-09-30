# 🎭 Demo SensorNode API

Simulates real sensor hardware without needing the Arduino. Perfect for remote development.

## 🚀 Quick Start

```bash
cd backend
python3 demo_sensor_api.py
```

API available at: **http://localhost:8004**

## 📊 Data Simulation

- **Pinch Strength**: 0-15 kg with variations
- **Grip Strength**: 0-50 kg with trends  
- **FSR Raw**: Usually 0, occasional spikes 50-1000
- **Timing**: 1-2 second intervals between readings (matches real sensor)

## 🔗 API Endpoints

### GET `/`
API information

### GET `/sensors/info`
Simulation parameters and data patterns

### GET `/sensors/discover`
Simulated device discovery (2-4.5s delay)

### GET `/sensors/stream`
Real-time data streaming (Server-Sent Events)
```bash
curl "http://localhost:8004/sensors/stream?duration=10&poll_interval=0.1"
```

### POST `/sensors/collect`
Batch data collection
```bash
curl -X POST "http://localhost:8004/sensors/collect" \
  -H "Content-Type: application/json" \
  -d '{"duration_seconds": 10, "poll_interval": 0.1}'
```

## 📝 Quick Test

```bash
# Install dependencies
pip install -r requirements.txt

# Start API
python3 demo_sensor_api.py

# Test in another terminal
curl "http://localhost:8004/sensors/info"
```

**Note**: Demo runs on port **8004**, real sensor API on port **8003**
