# 🚀 Platform Launcher Guide

This guide explains how to use the automated launcher scripts for the Secure Document Management Platform.

## 📋 Available Scripts

### 🛠️ `setup.sh` - Initial Setup
**Use this first!** Installs dependencies and prepares the environment.

```bash
./setup.sh
```

**What it does:**
- ✅ Creates backend `.env` file with correct database credentials
- ✅ Installs all backend dependencies (`npm install`)
- ✅ Installs all frontend dependencies (`npm install`)
- ✅ Validates directory structure

---

### 🚀 `start.sh` - Full Platform Launch (Recommended)
**Complete startup with health checks and monitoring.**

```bash
./start.sh
```

**What it does:**
- ✅ Starts Docker services (PostgreSQL + Redis)
- ✅ Installs dependencies if needed
- ✅ Creates environment files
- ✅ Runs backend tests
- ✅ Starts backend server (port 4000)
- ✅ Starts frontend server (port 3000)
- ✅ Performs health checks
- ✅ Displays service status and URLs
- ✅ Graceful shutdown with Ctrl+C

---

### ⚡ `quick-start.sh` - Quick Launch
**Minimal startup for experienced users.**

```bash
./quick-start.sh
```

**What it does:**
- ✅ Starts Docker services
- ✅ Starts backend and frontend immediately
- ⚠️ No dependency installation or health checks
- ⚠️ Assumes setup was already done

---

### 🛑 `stop.sh` - Stop All Services
**Gracefully stops all platform services.**

```bash
./stop.sh
```

**What it does:**
- ✅ Stops frontend React server
- ✅ Stops backend NestJS server
- ✅ Stops Docker containers
- ✅ Cleans up all processes

---

## 🔄 Recommended Workflow

### First Time Setup
```bash
# 1. Initial setup (run once)
./setup.sh

# 2. Launch the platform
./start.sh
```

### Daily Usage
```bash
# Quick launch (if already set up)
./quick-start.sh

# Or full launch (safer)
./start.sh
```

### Shutdown
```bash
# Stop all services
./stop.sh
```

---

## 🌐 Access URLs

Once launched, the platform is available at:

- **🎨 Frontend Application**: http://localhost:3000
- **🔧 Backend API**: http://localhost:4000
- **📊 GraphQL Playground**: http://localhost:4000/graphql
- **💚 Health Check**: http://localhost:4000/health

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

## 🐛 Troubleshooting

### ❌ Port Already in Use
```bash
# Check what's using the ports
lsof -i :3000 -i :4000

# Kill existing processes
./stop.sh

# Then restart
./start.sh
```

### ❌ Docker Services Not Starting
```bash
# Check Docker status
docker ps

# Restart Docker services
docker-compose down
docker-compose up -d
```

### ❌ Dependencies Issues
```bash
# Clean install
rm -rf backend/node_modules frontend/node_modules
./setup.sh
```

### ❌ Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Recreate database
docker-compose down
docker-compose up -d
```

---

## 🔧 Manual Commands (Alternative)

If you prefer manual control:

```bash
# Start Docker services
docker-compose up -d

# Backend (Terminal 1)
cd backend
npm install
npm run start:dev

# Frontend (Terminal 2)  
cd frontend
npm install
npm start
```

---

## 📝 Environment Configuration

The scripts automatically create a `.env` file in the backend directory with:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=document_management

REDIS_HOST=localhost
REDIS_PORT=6379

PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

You can modify these values if needed for your environment.

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