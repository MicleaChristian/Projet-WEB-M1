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
    echo "⚠️  Please update the DATABASE_URL with your actual Render PostgreSQL connection string"
    cat > .env << 'EOF'
# Database Configuration (Update with your Render PostgreSQL URL)
DATABASE_URL="postgresql://username:password@hostname:5432/database_name?sslmode=require"

# Redis Configuration (Update with your Redis URL if using external Redis)
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
    echo "📝 .env file created - IMPORTANT: Update DATABASE_URL with your Render credentials"
else
    echo "✅ .env file already exists"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
cd ..
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd ../frontend
npm install

# Run database migrations if .env is configured
echo "🗃️  Setting up database..."
cd ../backend
if grep -q "postgresql://.*@.*:" .env; then
    echo "🔄 Running Prisma migrations..."
    npx prisma migrate deploy
    echo "✅ Database migrations completed"
else
    echo "⚠️  Database URL not configured. Please update .env and run:"
    echo "   cd backend && npx prisma migrate deploy"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Update backend/.env with your Render PostgreSQL URL"
echo "2. Run: cd backend && npx prisma migrate deploy"
echo "3. Start the platform: npm run dev"
echo ""
echo "📚 Available commands:"
echo "  npm run dev         - Start both backend and frontend"
echo "  npm run start:backend - Start backend only"
echo "  npm run start:frontend - Start frontend only"
echo "  npm test            - Run all tests"
echo ""
echo "🛑 To stop: npm run stop" 