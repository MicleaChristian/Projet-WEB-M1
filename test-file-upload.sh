#!/bin/bash

echo "🧪 Testing File Upload Functionality"
echo "=================================="

# First, register a test user
echo "1. Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(registerInput: { email: \"filetest@example.com\", password: \"password123\", firstName: \"Test\", lastName: \"User\" }) { access_token user { id email role } } }"
  }')

echo "Register response: $REGISTER_RESPONSE"

# Extract token
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Got authentication token: ${TOKEN:0:20}..."

# Create a test file
echo "2. Creating test file..."
echo "This is a test document for upload functionality" > test-upload.txt

# Test file upload
echo "3. Testing file upload..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:4000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-upload.txt" \
  -F "title=Test Upload Document" \
  -F "content=This document was uploaded via file upload")

echo "Upload response: $UPLOAD_RESPONSE"

# Test creating a simple document first
echo "4. Creating a simple document..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation { createDocument(createDocumentInput: { title: \"Test Document\", content: \"This is a test document\" }) { id title content createdAt } }"
  }')

echo "Create response: $CREATE_RESPONSE"

# Test GraphQL query to see uploaded documents
echo "5. Querying uploaded documents..."
DOCUMENTS_RESPONSE=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { documentsByUser { id title content createdAt } }"
  }')

echo "Documents response: $DOCUMENTS_RESPONSE"

# Clean up
rm -f test-upload.txt

echo ""
echo "🎉 File upload test completed!"
echo "✅ Frontend should be available at: http://localhost:3000"
echo "✅ Backend GraphQL playground: http://localhost:4000/graphql" 