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

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    print_info "Creating logs directory..."
    mkdir -p logs
    print_success "Logs directory created"
fi

# Start Fish & Places API (port 8000)
print_info "Starting Fish & Places API on port 8000..."
cd backend/fish_market
python3 fish_api.py > ../../logs/fish_api.log 2>&1 &
PID=$!
PIDS+=($PID)
cd ../..
sleep 1
if ps -p $PID > /dev/null 2>&1; then
    print_success "Fish & Places API started (PID: $PID)"
else
    print_error "Fish & Places API failed to start. Check logs/fish_api.log"
fi

# Start CTS Prediction API (port 8002)
print_info "Starting CTS Prediction API on port 8002..."
cd backend/cts_prediction
python3 cts_prediction_api.py > ../../logs/cts_api.log 2>&1 &
PID=$!
PIDS+=($PID)
cd ../..
sleep 1
if ps -p $PID > /dev/null 2>&1; then
    print_success "CTS Prediction API started (PID: $PID)"
else
    print_error "CTS Prediction API failed to start. Check logs/cts_api.log"
fi

# Start Demo Sensor API (port 8004)
print_info "Starting Demo Sensor API on port 8004..."
cd backend/sensor_api
python3 demo_sensor_api.py > ../../logs/sensor_api.log 2>&1 &
PID=$!
PIDS+=($PID)
cd ../..
sleep 1
if ps -p $PID > /dev/null 2>&1; then
    print_success "Demo Sensor API started (PID: $PID)"
else
    print_error "Demo Sensor API failed to start. Check logs/sensor_api.log"
fi

echo ""
print_info "🌐 Starting frontend (Vite + Convex)..."
echo ""

# Start frontend (includes Convex)
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
PID=$!
PIDS+=($PID)
cd ..
sleep 2
if ps -p $PID > /dev/null 2>&1; then
    print_success "Frontend started (PID: $PID)"
else
    print_error "Frontend failed to start. Check logs/frontend.log"
fi

echo ""
print_success "🎉 All services are running!"
echo ""
print_info "📊 Service URLs:"
echo "  - Frontend:           http://localhost:5173"
echo "  - Fish & Places API:  http://localhost:8000/docs"
echo "  - CTS Prediction:     http://localhost:8002/docs"
echo "  - Sensor API:         http://localhost:8004/docs"
echo ""
print_info "📝 Logs are in the ./logs directory"
echo ""
print_warning "Press Ctrl+C to stop all services"
echo ""

# Wait indefinitely
wait
