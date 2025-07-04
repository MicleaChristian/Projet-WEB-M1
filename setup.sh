#!/bin/bash

echo "⚙️ Setting up Secure Document Management Platform..."

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ This script must be run from the project root directory"
    exit 1
fi

# Setup backend environment
echo "🔧 Setting up backend environment..."
cd backend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
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
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the platform:"
echo "  ./start.sh      (Full startup with checks)"
echo "  ./quick-start.sh (Quick startup)"
echo ""
echo "🛑 To stop:"
echo "  ./stop.sh" 