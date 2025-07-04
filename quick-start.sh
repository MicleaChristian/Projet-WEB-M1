#!/bin/bash

# Quick Start Script - Minimal version
echo "🚀 Quick launching Secure Document Management Platform..."

# Start Docker services
echo "📦 Starting Docker services..."
docker-compose up -d

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

echo ""
echo "✅ Services starting..."
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:4000"
echo ""
echo "💡 To stop: kill $BACKEND_PID $FRONTEND_PID && docker-compose down"
echo "🛑 Or use: ./stop.sh"

wait 