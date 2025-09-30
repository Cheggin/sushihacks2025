import asyncio
import json
import time
import random
import math
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="Demo SensorNode API", version="1.0.0")

# Add CORS middleware to match existing API pattern
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class SensorReading(BaseModel):
    timestamp: float
    fsr_raw: int
    pinch_strength_kg: float
    grip_strength_kg: float

class SensorCollectionRequest(BaseModel):
    device_name: Optional[str] = "DemoSensorNode"
    duration_seconds: Optional[int] = 10
    poll_interval: Optional[float] = 0.1  # 100ms for faster data collection

class SensorCollectionResponse(BaseModel):
    success: bool
    message: str
    readings: List[SensorReading]
    metadata: Dict[str, Any]

class SensorStreamEvent(BaseModel):
    event: str  # "reading", "connected", "disconnected", "error", "complete"
    data: Optional[SensorReading] = None
    message: Optional[str] = None
    timestamp: float

# Simulate realistic sensor data based on real patterns
class SensorSimulator:
    def __init__(self):
        # Base values for realistic strength ranges
        self.base_fsr_raw = 0
        self.base_pinch_strength = 7.5   # kg (middle of 0-15 range)
        self.base_grip_strength = 25.0   # kg (middle of 0-50 range)
        
        # Noise and variation parameters for realistic ranges
        self.pinch_noise_range = 2.0     # Variations within 0-15 range
        self.grip_noise_range = 5.0      # Variations within 0-50 range
        self.fsr_occasional_spike = 0.05  # 5% chance of FSR spike
        
        # Simulation state
        self.time_offset = 0
        self.grip_trend = 0  # Gradual trend changes
        
    def generate_reading(self) -> SensorReading:
        """Generate a realistic sensor reading based on observed patterns."""
        
        # FSR Raw - mostly 0 with occasional spikes (simulating touch/pressure)
        if random.random() < self.fsr_occasional_spike:
            fsr_raw = random.randint(50, 1000)  # Pressure detected
        else:
            fsr_raw = self.base_fsr_raw  # No pressure
            
        # Pinch strength - range 0-15 kg with variations
        pinch_strength = self.base_pinch_strength + random.uniform(
            -self.pinch_noise_range, self.pinch_noise_range
        )
        
        # Grip strength - range 0-50 kg with gradual trends
        # Add slow sine wave for natural variation + random noise
        trend_component = 2.0 * math.sin(self.time_offset * 0.1)
        noise_component = random.uniform(-self.grip_noise_range, self.grip_noise_range)
        grip_strength = self.base_grip_strength + trend_component + noise_component
        
        # Ensure values stay within realistic ranges
        pinch_strength = max(0.0, min(15.0, pinch_strength))
        grip_strength = max(0.0, min(50.0, grip_strength))
        
        self.time_offset += 1
        
        return SensorReading(
            timestamp=time.time(),
            fsr_raw=fsr_raw,
            pinch_strength_kg=round(pinch_strength, 12),  # Match real precision
            grip_strength_kg=round(grip_strength, 12)
        )

# Global simulator instance
simulator = SensorSimulator()

async def simulate_device_discovery(target_name: str = "DemoSensorNode") -> str:
    """Simulate device discovery with realistic timing."""
    print(f"[DEMO] Scanning for device '{target_name}'...")
    
    # Simulate discovery time (2-5 seconds like real BLE)
    discovery_time = random.uniform(2.0, 4.5)
    await asyncio.sleep(discovery_time)
    
    # Always "find" the demo device
    demo_address = "DEMO-76459C79-F9C6-394B-24C6-18A7A28FA454"
    print(f"[DEMO] Found {target_name} at {demo_address}")
    return demo_address

async def collect_demo_sensor_data(address: str, duration: int = 10, poll_interval: float = 0.1) -> List[SensorReading]:
    """Simulate sensor data collection with realistic timing."""
    readings = []
    
    print(f"[DEMO] Connected to simulated device: {address}")
    
    # Simulate connection stabilization (like real BLE)
    await asyncio.sleep(0.5)
    
    start_time = time.time()
    
    while (time.time() - start_time) < duration:
        try:
            reading = simulator.generate_reading()
            readings.append(reading)
            
            print(f"[DEMO] FSR Raw: {reading.fsr_raw} | Pinch Strength: {reading.pinch_strength_kg:.12f} kg | Grip Strength: {reading.grip_strength_kg:.12f} kg")
            
            # Real sensor has 1-2 second delays between readings regardless of poll_interval
            actual_delay = max(poll_interval, random.uniform(1.0, 2.0))
            await asyncio.sleep(actual_delay)
            
        except Exception as e:
            print(f"[DEMO] Error generating reading: {e}")
            break
    
    return readings

async def stream_demo_sensor_data(address: str, duration: int = 10, poll_interval: float = 0.1):
    """Stream simulated sensor data as Server-Sent Events."""
    
    print(f"[DEMO] Connected to simulated device: {address}")
    
    # Send connection event after "connection"
    yield f"data: {json.dumps(SensorStreamEvent(event='connected', message='Connected to Demo SensorNode', timestamp=time.time()).dict())}\n\n"
    
    # Simulate connection stabilization
    await asyncio.sleep(0.5)
    
    start_time = time.time()
    
    while (time.time() - start_time) < duration:
        try:
            reading = simulator.generate_reading()
            
            # Send reading event
            event = SensorStreamEvent(event='reading', data=reading, timestamp=time.time())
            yield f"data: {json.dumps(event.dict())}\n\n"
            
            # Real sensor has 1-2 second delays between readings regardless of poll_interval
            actual_delay = max(poll_interval, random.uniform(1.0, 2.0))
            await asyncio.sleep(actual_delay)
            
        except Exception as e:
            error_event = SensorStreamEvent(event='error', message=f"Demo error: {str(e)}", timestamp=time.time())
            yield f"data: {json.dumps(error_event.dict())}\n\n"
            break
    
    # Send completion event
    complete_event = SensorStreamEvent(event='complete', message='Demo data collection completed', timestamp=time.time())
    yield f"data: {json.dumps(complete_event.dict())}\n\n"

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Demo SensorNode Data API - No Hardware Required!",
        "version": "1.0.0",
        "note": "This is a simulation for development without physical hardware",
        "endpoints": {
            "/sensors/collect": "POST - Collect simulated sensor data",
            "/sensors/stream": "GET - Stream simulated sensor data in real-time", 
            "/sensors/discover": "GET - Simulate device discovery",
            "/sensors/info": "GET - Get simulation info and parameters"
        }
    }

@app.get("/sensors/discover")
async def discover_demo_devices():
    """Simulate device discovery."""
    try:
        address = await simulate_device_discovery()
        return {"success": True, "device_found": True, "address": address, "note": "This is a simulated device"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo discovery failed: {str(e)}")

@app.get("/sensors/info")
async def get_simulation_info():
    """Get information about the simulation parameters."""
    return {
        "simulation_info": {
            "base_readings": {
                "fsr_raw": "Usually 0, occasionally 50-1000 (5% chance)",
                "pinch_strength_kg": f"Range 0-15 kg, centered around {simulator.base_pinch_strength:.1f} kg",
                "grip_strength_kg": f"Range 0-50 kg, centered around {simulator.base_grip_strength:.1f} kg"
            },
            "timing": {
                "discovery_time": "2-4.5 seconds (realistic BLE discovery)",
                "connection_stabilization": "0.5 seconds",
                "actual_reading_interval": "1-2 seconds (matches real sensor behavior)",
                "poll_interval_note": "poll_interval parameter is minimum, actual timing is 1-2s"
            },
            "data_patterns": {
                "pinch_strength": "0-15 kg range with moderate variations",
                "grip_strength": "0-50 kg range with gradual trends and variations",
                "fsr_raw": "Mostly 0, spikes when 'pressure' detected",
                "timing": "1-2 second intervals between readings (realistic sensor behavior)"
            }
        }
    }

@app.post("/sensors/collect", response_model=SensorCollectionResponse)
async def collect_demo_sensors(request: SensorCollectionRequest):
    """
    Collect simulated sensor data for specified duration.
    Returns all readings at once after collection is complete.
    """
    try:
        # Simulate device discovery
        address = await simulate_device_discovery(request.device_name)
        
        # Collect simulated data
        readings = await collect_demo_sensor_data(
            address, 
            duration=request.duration_seconds,
            poll_interval=request.poll_interval
        )
        
        return SensorCollectionResponse(
            success=True,
            message=f"Successfully collected {len(readings)} simulated readings over {request.duration_seconds} seconds",
            readings=readings,
            metadata={
                "device_address": address,
                "duration_seconds": request.duration_seconds,
                "poll_interval": request.poll_interval,
                "total_readings": len(readings),
                "collection_time": readings[-1].timestamp - readings[0].timestamp if readings else 0,
                "simulation": True,
                "note": "This is simulated data for development purposes"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo data collection failed: {str(e)}")

@app.get("/sensors/stream")
async def stream_demo_sensors(
    device_name: str = "DemoSensorNode",
    duration: int = 10,
    poll_interval: float = 0.1
):
    """
    Stream simulated sensor data in real-time using Server-Sent Events.
    Perfect for testing visualization without hardware.
    """
    try:
        # Simulate device discovery
        address = await simulate_device_discovery(device_name)
        
        # Return streaming response
        return StreamingResponse(
            stream_demo_sensor_data(address, duration, poll_interval),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo streaming failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🎭 Starting Demo SensorNode API - No Hardware Required!")
    print("📊 Simulating realistic sensor data patterns")
    print("🔗 API will be available at http://localhost:8004")
    uvicorn.run(app, host="0.0.0.0", port=8004)
