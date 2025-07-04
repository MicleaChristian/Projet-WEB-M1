# 🚀 Usage Guide - Secure Document Management Platform

## Available Commands (from root directory)

### 🏃 **Quick Start**
```bash
# Start backend only
npm run start:dev

# Start frontend only  
npm run start:frontend

# Start both backend and frontend simultaneously
npm run dev
```

### 🧪 **Testing**
```bash
# Run all tests (backend + frontend)
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run end-to-end tests
npm run test:e2e
```

### 🔨 **Building**
```bash
# Build both backend and frontend
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend
```

### 📦 **Installation**
```bash
# Install dependencies for both backend and frontend
npm run install:all
```

### 🎯 **Code Quality**
```bash
# Lint all code
npm run lint

# Format all code
npm run format
```

### 🗂️ **Alternative Commands (from subdirectories)**

#### Backend (from `backend/` directory)
```bash
cd backend
npm run start:dev    # Start development server
npm run start:prod   # Start production server
npm test            # Run unit tests
npm run test:e2e    # Run e2e tests
npm run lint        # Lint code
npm run format      # Format code
```

#### Frontend (from `frontend/` directory)
```bash
cd frontend
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
npm run lint        # Lint code
npm run format      # Format code
```

### 🌐 **URLs**
- **Backend**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql
- **Frontend**: http://localhost:3000 (or 3001 if 3000 is busy)

### 📋 **Health Check**
```bash
# Check backend health
curl -X GET http://localhost:4000/health

# Check GraphQL schema
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { name } } }"}'
```

### 🛠️ **Development Workflow**
1. **Start developing**: `npm run dev`
2. **Run tests**: `npm test`
3. **Build for production**: `npm run build`
4. **Check code quality**: `npm run lint`

### 🔧 **Troubleshooting**
- **Port already in use**: Kill existing processes or use different ports
- **Database connection**: Ensure PostgreSQL is running and `.env` is configured
- **Redis connection**: Ensure Redis is running for queue processing
- **Test failures**: Check database migrations are applied

### 📚 **Additional Resources**
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Test Summary](TEST_SUMMARY.md)
- [Project Status](PROJECT_STATUS.md) 