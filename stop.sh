#!/bin/bash

echo "🛑 Stopping Secure Document Management Platform..."

# Stop Node.js processes
echo "📱 Stopping frontend and backend services..."
pkill -f "react-scripts"
pkill -f "nest start"
pkill -f "npm.*start"

# Stop Docker services
echo "🐳 Stopping Docker services..."
docker-compose down

echo "✅ All services stopped" 