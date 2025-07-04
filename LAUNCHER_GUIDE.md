# 🚀 Launcher Scripts Guide

## Overview
The launcher scripts have been updated to work with the current project architecture (Render PostgreSQL, Prisma ORM, modern npm scripts).

## Available Scripts

### 📦 `setup.sh` - Initial Project Setup
```bash
./setup.sh
```
**What it does:**
- Installs all dependencies (root, backend, frontend)
- Creates `.env` file with proper Render PostgreSQL template
- Runs Prisma migrations if database is configured
- Provides next steps instructions

**Use this for:** First-time setup or after major changes

### 🚀 `start.sh` - Full Production Start
```bash
./start.sh
```
**What it does:**
- Checks for port conflicts (3000, 4000)
- Validates dependencies and .env file
- Starts backend with health checks
- Starts frontend with readiness checks
- Saves process IDs for clean shutdown
- Provides detailed status information

**Use this for:** Production-like startup with full validation

### ⚡ `quick-start.sh` - Quick Development Start
```bash
./quick-start.sh
```
**What it does:**
- Kills any existing processes on ports 3000/4000
- Starts backend and frontend immediately
- Saves PIDs for stop script
- Minimal validation for fastest startup

**Use this for:** Quick development iterations

### 🛑 `stop.sh` - Clean Shutdown
```bash
./stop.sh
```
**What it does:**
- Stops processes using saved PIDs first
- Kills remaining Node.js processes
- Frees up ports 3000 and 4000
- Cleans up Docker if running
- Removes temporary files

**Use this for:** Clean shutdown of all services

## NPM Script Integration

You can also use the convenient npm scripts from the root directory:

```bash
# Start both services
npm run dev

# Individual services
npm run start:backend
npm run start:frontend

# Testing
npm test
npm run test:backend
npm run test:frontend
npm run test:e2e

# Management
npm run setup    # Runs ./setup.sh
npm run stop     # Runs ./stop.sh
npm run quick-start  # Runs ./quick-start.sh
```

## Key Improvements

### ✅ **Fixed Issues:**
- **Database Configuration**: No longer depends on local Docker PostgreSQL
- **Prisma Integration**: Properly handles database migrations
- **Port Management**: Intelligent port conflict handling
- **Process Management**: Clean PID tracking and shutdown
- **Error Handling**: Better validation and error messages
- **Dependency Checks**: Validates setup before starting

### ✅ **Removed Dependencies:**
- **Docker**: No longer required for basic operation
- **TypeORM**: Updated for Prisma ORM
- **Complex Test Integration**: Tests separated from startup process

### ✅ **Enhanced Features:**
- **Interactive Port Handling**: Asks before killing existing processes
- **Health Checks**: Validates services are actually running
- **Colored Output**: Better visual feedback
- **PID Management**: Proper process tracking for clean shutdown

## Usage Recommendations

### For Development:
```bash
# First time setup
./setup.sh

# Daily development
./quick-start.sh

# When done
./stop.sh
```

### For Production/Demo:
```bash
# Setup and validate everything
./setup.sh

# Full production start
./start.sh

# Clean shutdown
./stop.sh
```

### For Testing:
```bash
# Run all tests
npm test

# Or individually
npm run test:backend
npm run test:frontend
```

## Environment Setup

The scripts now create a proper `.env` file template:

```env
# Database Configuration (Update with your Render PostgreSQL URL)
DATABASE_URL="postgresql://username:password@hostname:5432/database_name?sslmode=require"

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
```

## Troubleshooting

### Common Issues:

1. **Port Already in Use**:
   ```bash
   ./stop.sh  # Kill all processes
   ./start.sh # Restart with port checking
   ```

2. **Database Connection Error**:
   ```bash
   # Update backend/.env with correct DATABASE_URL
   cd backend && npx prisma migrate deploy
   ```

3. **Missing Dependencies**:
   ```bash
   ./setup.sh  # Reinstall all dependencies
   ```

4. **Permission Denied**:
   ```bash
   chmod +x *.sh  # Make scripts executable
   ```

## Process Management

The scripts now use intelligent process management:

- **PID Files**: `.backend_pid` and `.frontend_pid` for tracking
- **Graceful Shutdown**: Proper SIGTERM handling
- **Port Cleanup**: Automatic port freeing
- **Health Checks**: Ensures services are actually running

## Integration with Docker

While Docker is no longer required for basic operation, the scripts still support it:

- **Optional Docker**: Only starts if docker-compose.yml services are configured
- **Hybrid Mode**: Can run with external database and local Redis
- **Clean Shutdown**: Properly stops Docker services if running

This setup provides maximum flexibility for different deployment scenarios while maintaining simplicity for development.

---

## 🧪 Platform Features

- ✅ **User Authentication** (Register/Login with JWT)
- ✅ **Document Management** (Create, Read, Update, Delete)
- ✅ **File Upload** (PDF, images, documents)
- ✅ **Modern React UI** (Material-UI components)
- ✅ **GraphQL API** (Full schema with resolvers)
- ✅ **Message Queuing** (Redis + BullMQ)
- ✅ **PostgreSQL Database** (Persistent data storage)

---

## 🌐 Access URLs

Once launched, the platform is available at:

- **🎨 Frontend Application**: http://localhost:3000
- **🔧 Backend API**: http://localhost:4000
- **📊 GraphQL Playground**: http://localhost:4000/graphql
- **💚 Health Check**: http://localhost:4000/health

---

## 🎯 Support

If you encounter issues:

1. **Run full setup**: `./setup.sh`
2. **Use full launcher**: `./start.sh` (not quick-start)
3. **Check logs**: The full launcher shows detailed status
4. **Stop and restart**: `./stop.sh` then `./start.sh`
5. **Check Docker**: Ensure Docker Desktop is running

---

**✨ Enjoy your Secure Document Management Platform!** 