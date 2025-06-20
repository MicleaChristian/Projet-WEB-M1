# Secure Document Management Platform

A secure document management platform built with NestJS, GraphQL, Redis message queuing, and PostgreSQL.

## 🚀 Features

- **GraphQL API** with Code First approach
- **Document Management** (CRUD operations)
- **Message Queuing** with BullMQ and Redis for async processing
- **PostgreSQL Database** with TypeORM
- **Docker Support** for easy development setup
- **Validation** with class-validator
- **Audit Logging** through message queues

## 🛠 Tech Stack

- **Backend**: NestJS, GraphQL, TypeORM
- **Database**: PostgreSQL
- **Message Queue**: Redis + BullMQ
- **Validation**: class-validator, class-transformer
- **Testing**: Jest
- **Development**: Docker Compose

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Projet-WEB-M1

# Navigate to backend
cd backend

# Install dependencies
npm install
```

### 2. Start Infrastructure Services

```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose up -d

# This will start:
# - PostgreSQL on port 5432
# - Redis on port 6379
```

### 3. Environment Configuration

```bash
# Copy environment example
cp env.example .env

# Edit .env file with your configuration if needed
```

### 4. Start the Application

```bash
# Development mode with hot reload
npm run start:dev

# The application will be available at:
# - API: http://localhost:4000
# - GraphQL Playground: http://localhost:4000/graphql
```

## 📊 GraphQL API

### Authentication Endpoints

```graphql
# Register new user
mutation {
  register(registerInput: {
    email: "user@example.com"
    password: "password123"
    firstName: "John"
    lastName: "Doe"
  }) {
    access_token
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}

# Login user
mutation {
  login(loginInput: {
    email: "user@example.com"
    password: "password123"
  }) {
    access_token
    user {
      id
      email
    }
  }
}

# Get current user (requires authentication)
query {
  me {
    id
    email
    firstName
    lastName
    role
  }
}
```

### Document Operations (Require Authentication)

**Note**: All document operations require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

```graphql
# Get user's documents
query {
  documents {
    id
    title
    content
    userId
    createdAt
    updatedAt
  }
}

# Get documents by user (admin or own documents)
query {
  documentsByUser(userId: "user-id") {
    id
    title
    content
    createdAt
  }
}

# Get single document (if user owns it or is admin)
query {
  document(id: "document-id") {
    id
    title
    content
    userId
    createdAt
    updatedAt
  }
}

# Create document (userId automatically set from token)
mutation {
  createDocument(createDocumentInput: {
    title: "My Document"
    content: "Document content here"
  }) {
    id
    title
    content
    userId
    createdAt
  }
}

# Update document (if user owns it or is admin)
mutation {
  updateDocument(updateDocumentInput: {
    id: "document-id"
    title: "Updated Title"
    content: "Updated content"
  }) {
    id
    title
    content
    updatedAt
  }
}

# Delete document (if user owns it or is admin)
mutation {
  removeDocument(id: "document-id") {
    id
    title
  }
}
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format
```

## 🐳 Docker Commands

```bash
# Start infrastructure services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.module.ts          # Main application module
│   ├── main.ts                # Application bootstrap
│   ├── config/                # Configuration module
│   ├── documents/             # Document management module
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── entities/          # Database entities
│   │   ├── documents.service.ts
│   │   ├── documents.resolver.ts
│   │   ├── documents.module.ts
│   │   └── document.processor.ts  # Queue job processor
│   └── health/                # Health check module
├── package.json
├── tsconfig.json
├── nest-cli.json
└── env.example
```

## 🔄 Message Queue System

The application uses BullMQ with Redis for async processing:

- **Document Created**: Triggers audit logging and analytics
- **Document Updated**: Logs changes and updates search indexes
- **Document Deleted**: Cleanup and audit trail

Queue jobs are processed in the background and logged for monitoring.

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 🔒 Security Features (Planned)

- JWT Authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration

## 🎯 Bonus Features Implemented

✅ **JWT Authentication & Authorization**: Complete auth system with user registration, login, and role-based access control  
✅ **Comprehensive Testing Suite**: Unit tests, integration tests, and automated testing scripts  
✅ **CI/CD Pipeline**: GitHub Actions with automated testing, security audits, and Docker builds  
✅ **Production Docker Setup**: Multi-stage builds, security hardening, and health checks  
✅ **Enhanced Security**: Input validation, password hashing, CORS, and audit logging  
✅ **Advanced Monitoring**: Health checks, queue monitoring, and structured logging  

For detailed information about all bonus features, see [BONUS_FEATURES.md](./BONUS_FEATURES.md)

## 📈 Future Enhancements

1. **File Upload**: Support document file attachments with S3/MinIO
2. **Frontend**: Create React/Vue frontend with authentication
3. **Real-time Features**: WebSocket support for live collaboration
4. **Advanced Search**: Full-text search with Elasticsearch
5. **Deployment**: Kubernetes manifests for container orchestration
6. **Observability**: Prometheus metrics and Grafana dashboards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
