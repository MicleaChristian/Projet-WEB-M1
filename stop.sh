#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🛑 Stopping Secure Document Management Platform..."

# Stop processes using saved PIDs first
if [ -f ".backend_pid" ]; then
    BACKEND_PID=$(cat .backend_pid)
    print_status "Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    rm .backend_pid
fi

if [ -f ".frontend_pid" ]; then
    FRONTEND_PID=$(cat .frontend_pid)
    print_status "Stopping frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    rm .frontend_pid
fi

# Stop all Node.js processes related to the project
print_status "Stopping all related Node.js processes..."
pkill -f "react-scripts" 2>/dev/null
pkill -f "nest start" 2>/dev/null
pkill -f "npm.*start" 2>/dev/null
pkill -f "node.*start" 2>/dev/null

# Stop processes on specific ports
print_status "Freeing up ports 3000 and 4000..."
if lsof -i :3000 &> /dev/null; then
    print_warning "Killing remaining processes on port 3000..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
fi

if lsof -i :4000 &> /dev/null; then
    print_warning "Killing remaining processes on port 4000..."
    lsof -ti :4000 | xargs kill -9 2>/dev/null
fi

# Only stop Docker if it's running and has our services
if command -v docker &> /dev/null && docker-compose ps | grep -q "Up"; then
    print_status "Stopping Docker services..."
    docker-compose down
fi

print_success "All services stopped"
print_status "Ports 3000 and 4000 are now free"

# Clean up any remaining pid files
rm -f .backend_pid .frontend_pid 2>/dev/null

echo "✅ Platform stopped successfully" 