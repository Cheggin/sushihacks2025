import asyncio
import json
import time
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from bleak import BleakScanner, BleakClient
import struct

# Suppress noisy CoreBluetooth warnings
logging.getLogger("bleak.backends.corebluetooth").setLevel(logging.ERROR)

app = FastAPI(title="Arduino Sensor API", version="1.0.0")

# Add CORS middleware to match existing API pattern
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# UUIDs matching the Arduino characteristics
FSR_RAW_UUID = "00002a5a-0000-1000-8000-00805f9b34fb"
FSR_WEIGHT_UUID = "00002a58-0000-1000-8000-00805f9b34fb"
LOADCELL_WEIGHT_UUID = "00002a59-0000-1000-8000-00805f9b34fb"

# Device cache to avoid repeated discovery delays
device_cache = {}
cache_timeout = 30  # Cache device addresses for 30 seconds

class SensorReading(BaseModel):
    timestamp: float
    fsr_raw: int
    pinch_strength_kg: float
    grip_strength_kg: float

class SensorCollectionRequest(BaseModel):
    device_name: Optional[str] = "SensorNode"
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

async def discover_arduino_device(target_name: str = "SensorNode", use_cache: bool = True) -> Optional[str]:
    """Scan for BLE devices and return address of target device."""
    
    # Check cache first to avoid repeated scans
    if use_cache and target_name in device_cache:
        cached_address, cached_time = device_cache[target_name]
        if time.time() - cached_time < cache_timeout:
            print(f"Using cached address for {target_name}: {cached_address}")
            return cached_address
    
    print(f"Scanning for device '{target_name}'...")
    try:
        devices = await BleakScanner.discover(timeout=5.0)
        for device in devices:
            print(f"Device found: {device.name} / {device.address}")
            if device.name == target_name:
                print(f"Found {device.name} at {device.address}")
                # Cache the result
                device_cache[target_name] = (device.address, time.time())
                return device.address
        print(f"Device '{target_name}' not found.")
        return None
    except Exception as e:
        print(f"Error during device discovery: {e}")
        return None

async def collect_sensor_data(address: str, duration: int = 10, poll_interval: float = 0.1) -> List[SensorReading]:
    """Connect to Arduino and collect sensor data for specified duration."""
    readings = []
    
    try:
        async with BleakClient(address) as client:
            print(f"Connected: {client.is_connected}")
            
            # Allow connection stabilization and service discovery
            await asyncio.sleep(0.5)  # Increased to allow full service discovery
            
            # Start timing AFTER connection is established and stable
            start_time = time.time()
            
            while client.is_connected and (time.time() - start_time) < duration:
                try:
                    # Read characteristics
                    fsr_raw_bytes = await client.read_gatt_char(FSR_RAW_UUID)
                    fsr_weight_bytes = await client.read_gatt_char(FSR_WEIGHT_UUID)
                    loadcell_weight_bytes = await client.read_gatt_char(LOADCELL_WEIGHT_UUID)
                    
                    # Convert bytes to values
                    fsr_raw = int.from_bytes(fsr_raw_bytes, byteorder='little', signed=True)
                    pinch_strength_kg = struct.unpack('<f', fsr_weight_bytes)[0]
                    grip_strength_kg = struct.unpack('<f', loadcell_weight_bytes)[0]
                    
                    reading = SensorReading(
                        timestamp=time.time(),
                        fsr_raw=fsr_raw,
                        pinch_strength_kg=pinch_strength_kg,
                        grip_strength_kg=grip_strength_kg
                    )
                    readings.append(reading)
                    
                    print(f"FSR Raw: {fsr_raw} | Pinch Strength: {pinch_strength_kg:.4f} kg | Grip Strength: {grip_strength_kg:.3f} kg")
                    
                    await asyncio.sleep(poll_interval)
                    
                except Exception as e:
                    print(f"Error reading characteristics: {e}")
                    break
                    
    except Exception as e:
        print(f"Connection error: {e}")
        raise
    
    return readings

async def stream_sensor_data(address: str, duration: int = 10, poll_interval: float = 0.1):
    """Stream sensor data as Server-Sent Events."""
    
    try:
        async with BleakClient(address) as client:
            print(f"Connected: {client.is_connected}")
            
            # Send connection event after successful connection
            yield f"data: {json.dumps(SensorStreamEvent(event='connected', message='Connected to SensorNode', timestamp=time.time()).dict())}\n\n"
            
            # Allow connection stabilization and service discovery
            await asyncio.sleep(0.5)  # Increased to allow full service discovery
            
            # Start timing AFTER connection is established and stable
            start_time = time.time()
            
            while client.is_connected and (time.time() - start_time) < duration:
                try:
                    # Read characteristics
                    fsr_raw_bytes = await client.read_gatt_char(FSR_RAW_UUID)
                    fsr_weight_bytes = await client.read_gatt_char(FSR_WEIGHT_UUID)
                    loadcell_weight_bytes = await client.read_gatt_char(LOADCELL_WEIGHT_UUID)
                    
                    # Convert bytes to values
                    fsr_raw = int.from_bytes(fsr_raw_bytes, byteorder='little', signed=True)
                    pinch_strength_kg = struct.unpack('<f', fsr_weight_bytes)[0]
                    grip_strength_kg = struct.unpack('<f', loadcell_weight_bytes)[0]
                    
                    reading = SensorReading(
                        timestamp=time.time(),
                        fsr_raw=fsr_raw,
                        pinch_strength_kg=pinch_strength_kg,
                        grip_strength_kg=grip_strength_kg
                    )
                    
                    # Send reading event
                    event = SensorStreamEvent(event='reading', data=reading, timestamp=time.time())
                    yield f"data: {json.dumps(event.dict())}\n\n"
                    
                    await asyncio.sleep(poll_interval)
                    
                except Exception as e:
                    error_event = SensorStreamEvent(event='error', message=f"Error reading sensors: {str(e)}", timestamp=time.time())
                    yield f"data: {json.dumps(error_event.dict())}\n\n"
                    break
                    
    except Exception as e:
        error_event = SensorStreamEvent(event='error', message=f"Connection error: {str(e)}", timestamp=time.time())
        yield f"data: {json.dumps(error_event.dict())}\n\n"
    
    # Send completion event
    complete_event = SensorStreamEvent(event='complete', message='Data collection completed', timestamp=time.time())
    yield f"data: {json.dumps(complete_event.dict())}\n\n"

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "SensorNode Data API",
        "version": "1.0.0",
        "endpoints": {
            "/sensors/collect": "POST - Collect sensor data for specified duration",
            "/sensors/stream": "GET - Stream sensor data in real-time", 
            "/sensors/discover": "GET - Discover available SensorNode devices",
            "/sensors/scan": "GET - Scan all BLE devices for debugging",
            "/sensors/cache/clear": "POST - Clear device address cache"
        }
    }

@app.get("/sensors/discover")
async def discover_devices():
    """Discover available SensorNode BLE devices."""
    try:
        address = await discover_arduino_device()
        if address:
            return {"success": True, "device_found": True, "address": address}
        else:
            return {"success": True, "device_found": False, "message": "SensorNode device not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Discovery failed: {str(e)}")

@app.get("/sensors/scan")
async def scan_all_devices():
    """Scan for all available BLE devices for debugging."""
    try:
        print("Scanning for all BLE devices...")
        devices = await BleakScanner.discover(timeout=10.0)
        device_list = []
        for device in devices:
            device_info = {
                "name": device.name or "Unknown",
                "address": device.address,
                "rssi": getattr(device, 'rssi', None)
            }
            device_list.append(device_info)
            print(f"Found: {device_info}")
        
        return {
            "success": True,
            "total_devices": len(device_list),
            "devices": device_list,
            "message": f"Found {len(device_list)} BLE devices"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

@app.post("/sensors/cache/clear")
async def clear_device_cache():
    """Clear the device address cache to force fresh discovery."""
    global device_cache
    device_cache.clear()
    return {"success": True, "message": "Device cache cleared"}

@app.post("/sensors/collect", response_model=SensorCollectionResponse)
async def collect_sensors(request: SensorCollectionRequest):
    """
    Collect sensor data from Arduino for specified duration.
    Returns all readings at once after collection is complete.
    """
    try:
        # Discover device
        address = await discover_arduino_device(request.device_name)
        if not address:
            raise HTTPException(status_code=404, detail=f"SensorNode device '{request.device_name}' not found")
        
        # Collect data
        readings = await collect_sensor_data(
            address, 
            duration=request.duration_seconds,
            poll_interval=request.poll_interval
        )
        
        return SensorCollectionResponse(
            success=True,
            message=f"Successfully collected {len(readings)} readings over {request.duration_seconds} seconds",
            readings=readings,
            metadata={
                "device_address": address,
                "duration_seconds": request.duration_seconds,
                "poll_interval": request.poll_interval,
                "total_readings": len(readings),
                "collection_time": readings[-1].timestamp - readings[0].timestamp if readings else 0
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data collection failed: {str(e)}")

@app.get("/sensors/stream")
async def stream_sensors(
    device_name: str = "SensorNode",
    duration: int = 10,
    poll_interval: float = 0.1
):
    """
    Stream sensor data from SensorNode in real-time using Server-Sent Events.
    Perfect for visualization over time.
    """
    try:
        # Discover device
        address = await discover_arduino_device(device_name)
        if not address:
            raise HTTPException(status_code=404, detail=f"SensorNode device '{device_name}' not found")
        
        # Return streaming response
        return StreamingResponse(
            stream_sensor_data(address, duration, poll_interval),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Streaming failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
