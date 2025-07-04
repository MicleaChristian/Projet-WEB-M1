#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
}

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_header "🚀 SECURE DOCUMENT MANAGEMENT PLATFORM"

# Check for existing processes
print_status "Checking for existing processes..."
if lsof -i :4000 &> /dev/null; then
    print_warning "Port 4000 is already in use (Backend)"
    echo "Current processes on port 4000:"
    lsof -i :4000
    read -p "Kill existing processes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Killing processes on port 4000..."
        lsof -ti :4000 | xargs kill -9
        sleep 2
    fi
fi

if lsof -i :3000 &> /dev/null; then
    print_warning "Port 3000 is already in use (Frontend)"
    echo "Current processes on port 3000:"
    lsof -i :3000
    read -p "Kill existing processes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Killing processes on port 3000..."
        lsof -ti :3000 | xargs kill -9
        sleep 2
    fi
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    print_error ".env file not found in backend directory"
    print_error "Please run ./setup.sh first or create backend/.env with your database configuration"
    exit 1
fi

# Check if dependencies are installed
print_status "Checking dependencies..."
if [ ! -d "backend/node_modules" ]; then
    print_error "Backend dependencies not installed. Run: cd backend && npm install"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    print_error "Frontend dependencies not installed. Run: cd frontend && npm install"
    exit 1
fi

# Start Backend
print_header "🔧 Starting Backend (NestJS)"
cd backend

print_status "Starting backend server..."
npm run start:dev &
BACKEND_PID=$!
print_success "Backend starting with PID: $BACKEND_PID"

# Wait for backend to be ready
print_status "Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        print_success "Backend is ready at http://localhost:4000"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend failed to start after 30 attempts"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 2
done

# Start Frontend
print_header "🎨 Starting Frontend (React)"
cd ../frontend

print_status "Starting frontend server..."
npm start &
FRONTEND_PID=$!
print_success "Frontend starting with PID: $FRONTEND_PID"

# Wait for frontend to be ready
print_status "Waiting for frontend to start..."
for i in {1..20}; do
    if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is ready at http://localhost:3000"
        break
    fi
    if [ $i -eq 20 ]; then
        print_error "Frontend failed to start after 20 attempts"
        kill $FRONTEND_PID 2>/dev/null
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 3
done

# Success message
print_header "✅ PLATFORM READY"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
echo "   GraphQL:  http://localhost:4000/graphql"
echo ""
echo "📊 Process IDs:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop.sh"
echo "   or: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📱 The application is now running!"

# Save PIDs for stop script
echo "$BACKEND_PID" > .backend_pid
echo "$FRONTEND_PID" > .frontend_pid

# Wait for processes
wait 