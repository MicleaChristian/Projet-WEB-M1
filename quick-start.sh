#!/bin/bash

# Quick Start Script - Minimal version for development
echo "🚀 Quick launching Secure Document Management Platform..."

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ This script must be run from the project root directory"
    exit 1
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ .env file not found. Please run ./setup.sh first"
    exit 1
fi

# Quick port cleanup
echo "🔧 Cleaning up ports..."
lsof -ti :3000 | xargs kill -9 2>/dev/null
lsof -ti :4000 | xargs kill -9 2>/dev/null

# Start backend
echo "🔧 Starting backend..."
cd backend
npm run start:dev &
BACKEND_PID=$!

# Start frontend  
echo "🎨 Starting frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Save PIDs for stop script
echo "$BACKEND_PID" > ../.backend_pid
echo "$FRONTEND_PID" > ../.frontend_pid

echo ""
echo "✅ Services starting..."
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:4000"
echo "📊 GraphQL:  http://localhost:4000/graphql"
echo ""
echo "🛑 To stop: ./stop.sh"
echo "💡 Or kill processes: kill $BACKEND_PID $FRONTEND_PID"

# Wait for processes
wait 