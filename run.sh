#!/bin/bash

# CARP - Comprehensive Aquatic Research Platform
# Startup script to run all services

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Store PIDs for cleanup
PIDS=()

# Cleanup function
cleanup() {
    print_warning "Shutting down all services..."
    for pid in "${PIDS[@]}"; do
        if ps -p $pid > /dev/null 2>&1; then
            kill -9 $pid 2>/dev/null || true
        fi
    done
    print_success "All services stopped"
    exit 0
}

# Register cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

print_info "🐟 Starting CARP - Comprehensive Aquatic Research Platform"
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
fi

# Check if backend dependencies are installed
if ! python3 -c "import fastapi" &> /dev/null; then
    print_warning "Backend dependencies may not be installed"
    print_info "Installing backend dependencies..."
    cd backend
    pip install -r requirements.txt
    cd ..
    print_success "Backend dependencies installed"
fi

echo ""
print_info "🚀 Starting backend services..."
echo ""

# Start Fish Occurrence API (port 8000)
print_info "Starting Fish Occurrence API on port 8000..."
cd backend
python3 fish_api.py > ../logs/fish_api.log 2>&1 &
PIDS+=($!)
cd ..
sleep 1
print_success "Fish Occurrence API started (PID: ${PIDS[-1]})"

# Start Fish Markets API (port 8001)
print_info "Starting Fish Markets API on port 8001..."
cd backend/fish_market
python3 places_api.py > ../../logs/markets_api.log 2>&1 &
PIDS+=($!)
cd ../..
sleep 1
print_success "Fish Markets API started (PID: ${PIDS[-1]})"

# Start CTS Prediction API (port 8002)
print_info "Starting CTS Prediction API on port 8002..."
cd backend/cts_prediction
python3 cts_prediction_api.py > ../../logs/cts_api.log 2>&1 &
PIDS+=($!)
cd ../..
sleep 1
print_success "CTS Prediction API started (PID: ${PIDS[-1]})"

# Start Demo Sensor API (port 8004)
print_info "Starting Demo Sensor API on port 8004..."
cd backend/sensor_api
python3 demo_sensor_api.py > ../../logs/sensor_api.log 2>&1 &
PIDS+=($!)
cd ../..
sleep 1
print_success "Demo Sensor API started (PID: ${PIDS[-1]})"

echo ""
print_info "🌐 Starting frontend (Vite + Convex)..."
echo ""

# Start frontend (includes Convex)
cd frontend
npm run dev &
PIDS+=($!)
cd ..
sleep 2
print_success "Frontend started (PID: ${PIDS[-1]})"

echo ""
print_success "🎉 All services are running!"
echo ""
print_info "📊 Service URLs:"
echo "  - Frontend:           http://localhost:5173"
echo "  - Fish API:           http://localhost:8000/docs"
echo "  - Markets API:        http://localhost:8001/docs"
echo "  - CTS Prediction:     http://localhost:8002/docs"
echo "  - Sensor API:         http://localhost:8004/docs"
echo ""
print_info "📝 Logs are in the ./logs directory"
echo ""
print_warning "Press Ctrl+C to stop all services"
echo ""

# Wait indefinitely
wait
