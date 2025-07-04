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
    print_error "Make sure you're in the Projet-WEB-M1 directory"
    exit 1
fi

print_header "🚀 SECURE DOCUMENT MANAGEMENT PLATFORM LAUNCHER"

# Step 1: Start Docker services
print_header "🐳 Starting Docker Services"
print_status "Starting PostgreSQL and Redis containers..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! docker-compose up -d; then
    print_error "Failed to start Docker services"
    exit 1
fi

print_success "Docker services started successfully"

# Step 2: Setup Backend Environment
print_header "⚙️ Setting up Backend Environment"
cd backend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file from template..."
    cat > .env << 'EOF'
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=document_management

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Application Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_FOLDER=./uploads
EOF
    print_success ".env file created"
else
    print_success ".env file already exists"
fi

# Step 3: Install Backend Dependencies
print_header "📦 Installing Backend Dependencies"
print_status "Installing Node.js packages for backend..."

if ! npm install; then
    print_error "Failed to install backend dependencies"
    exit 1
fi

print_success "Backend dependencies installed"

# Step 4: Install Frontend Dependencies
print_header "🎨 Installing Frontend Dependencies"
cd ../frontend

print_status "Installing Node.js packages for frontend..."

if ! npm install; then
    print_error "Failed to install frontend dependencies"
    exit 1
fi

print_success "Frontend dependencies installed"

# Step 5: Run Tests
print_header "🧪 Running Backend Tests"
cd ../backend

print_status "Running backend test suite..."
if npm run test; then
    print_success "All tests passed!"
else
    print_warning "Some tests failed, but continuing..."
fi

# Step 6: Start Services
print_header "🚀 Starting Services"

# Check if ports are available
if lsof -i :4000 &> /dev/null; then
    print_warning "Port 4000 is already in use. Attempting to continue..."
fi

if lsof -i :3000 &> /dev/null; then
    print_warning "Port 3000 is already in use. Attempting to continue..."
fi

print_status "Starting backend server (NestJS)..."
cd backend

# Start backend in background
npm run start:dev &
BACKEND_PID=$!

print_status "Backend starting with PID: $BACKEND_PID"

# Wait for backend to start
print_status "Waiting for backend to start..."
sleep 10

# Check if backend is responding
for i in {1..30}; do
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        print_success "Backend is responding on http://localhost:4000"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend failed to start after 30 attempts"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    print_status "Attempt $i/30: Waiting for backend..."
    sleep 2
done

# Start frontend
print_status "Starting frontend server (React)..."
cd ../frontend

# Start frontend in background
npm start &
FRONTEND_PID=$!

print_status "Frontend starting with PID: $FRONTEND_PID"

# Wait for frontend to start
print_status "Waiting for frontend to start..."
sleep 15

# Check if frontend is responding
for i in {1..20}; do
    if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is responding on http://localhost:3000"
        break
    fi
    if [ $i -eq 20 ]; then
        print_error "Frontend failed to start after 20 attempts"
        kill $FRONTEND_PID 2>/dev/null
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    print_status "Attempt $i/20: Waiting for frontend..."
    sleep 3
done

# Final status
print_header "✅ PLATFORM SUCCESSFULLY LAUNCHED"

echo -e "${GREEN}🎉 All services are running!${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC}     http://localhost:3000"
echo -e "${BLUE}🔧 Backend API:${NC}  http://localhost:4000"
echo -e "${BLUE}📊 GraphQL:${NC}     http://localhost:4000/graphql"
echo -e "${BLUE}💚 Health Check:${NC} http://localhost:4000/health"
echo ""
echo -e "${YELLOW}Process IDs:${NC}"
echo -e "  Backend PID: $BACKEND_PID"
echo -e "  Frontend PID: $FRONTEND_PID"
echo ""
echo -e "${BLUE}To stop the services:${NC}"
echo -e "  kill $BACKEND_PID $FRONTEND_PID"
echo -e "  docker-compose down"
echo ""
echo -e "${GREEN}✨ Ready to use! Open http://localhost:3000 in your browser${NC}"

# Wait for user to stop
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services...${NC}"

# Handle shutdown gracefully
cleanup() {
    print_header "🛑 Shutting Down Services"
    print_status "Stopping frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    print_status "Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    print_status "Stopping Docker services..."
    docker-compose down
    print_success "All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
while true; do
    sleep 1
done 