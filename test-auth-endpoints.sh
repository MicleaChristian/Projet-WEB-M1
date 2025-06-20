#!/bin/bash

echo "🔐 Secure Document Management Platform - Authentication Testing"
echo "============================================================="
echo ""

BASE_URL="http://localhost:4000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local test_name="$1"
    local expected="$2"
    local response="$3"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    
    if [[ "$response" == *"$expected"* ]]; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "Expected: $expected"
        echo "Got: $response"
    fi
    echo ""
}

echo "1. Health Check"
health_response=$(curl -s $BASE_URL/health)
test_endpoint "Health endpoint" "OK" "$health_response"

echo "2. GraphQL Schema Introspection"
schema_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"query":"{ __schema { queryType { name } } }"}' $BASE_URL/graphql)
test_endpoint "GraphQL schema" '"queryType":{"name":"Query"}' "$schema_response"

echo "3. User Registration"
register_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "query": "mutation Register($registerInput: RegisterInput!) { register(registerInput: $registerInput) { access_token user { id email firstName lastName role } } }",
  "variables": {
    "registerInput": {
      "email": "testuser@example.com",
      "password": "password123",
      "firstName": "Test",
      "lastName": "User"
    }
  }
}' $BASE_URL/graphql)
test_endpoint "User registration" '"access_token"' "$register_response"

# Extract access token and user ID for subsequent tests
ACCESS_TOKEN=$(echo $register_response | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo $register_response | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo -e "${YELLOW}Extracted Access Token: ${ACCESS_TOKEN:0:20}...${NC}"
echo -e "${YELLOW}Extracted User ID: $USER_ID${NC}"
echo ""

if [ ! -z "$ACCESS_TOKEN" ]; then
    echo "4. Get Current User (Me Query)"
    me_response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d '{
      "query": "query { me { id email firstName lastName role } }"
    }' $BASE_URL/graphql)
    test_endpoint "Current user query" '"testuser@example.com"' "$me_response"

    echo "5. Create Document with Authentication"
    create_doc_response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d '{
      "query": "mutation CreateDocument($createDocumentInput: CreateDocumentInput!) { createDocument(createDocumentInput: $createDocumentInput) { id title content userId } }",
      "variables": {
        "createDocumentInput": {
          "title": "Authenticated Document",
          "content": "This document was created with authentication"
        }
      }
    }' $BASE_URL/graphql)
    test_endpoint "Create authenticated document" '"Authenticated Document"' "$create_doc_response"

    # Extract document ID
    DOC_ID=$(echo $create_doc_response | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    echo "6. Get User Documents"
    user_docs_response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d '{
      "query": "query { documents { id title content userId } }"
    }' $BASE_URL/graphql)
    test_endpoint "Get user documents" '"documents"' "$user_docs_response"

    if [ ! -z "$DOC_ID" ]; then
        echo "7. Update Document"
        update_doc_response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d "{
          \"query\": \"mutation UpdateDocument(\$updateDocumentInput: UpdateDocumentInput!) { updateDocument(updateDocumentInput: \$updateDocumentInput) { id title content } }\",
          \"variables\": {
            \"updateDocumentInput\": {
              \"id\": \"$DOC_ID\",
              \"title\": \"Updated Authenticated Document\"
            }
          }
        }" $BASE_URL/graphql)
        test_endpoint "Update document" '"Updated Authenticated Document"' "$update_doc_response"

        echo "8. Get Single Document"
        single_doc_response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d "{
          \"query\": \"query { document(id: \\\"$DOC_ID\\\") { id title content userId } }\"
        }" $BASE_URL/graphql)
        test_endpoint "Get single document" '"document"' "$single_doc_response"
    fi
fi

echo "9. Login with Existing User"
login_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "query": "mutation Login($loginInput: LoginInput!) { login(loginInput: $loginInput) { access_token user { email } } }",
  "variables": {
    "loginInput": {
      "email": "testuser@example.com",
      "password": "password123"
    }
  }
}' $BASE_URL/graphql)
test_endpoint "User login" '"access_token"' "$login_response"

echo "10. Unauthorized Access Test"
unauth_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "query": "query { documents { id title } }"
}' $BASE_URL/graphql)
test_endpoint "Unauthorized access" '"errors"' "$unauth_response"

echo "11. Invalid Login Credentials"
invalid_login_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "query": "mutation Login($loginInput: LoginInput!) { login(loginInput: $loginInput) { access_token } }",
  "variables": {
    "loginInput": {
      "email": "testuser@example.com",
      "password": "wrongpassword"
    }
  }
}' $BASE_URL/graphql)
test_endpoint "Invalid credentials" '"errors"' "$invalid_login_response"

echo "12. Duplicate Registration Test"
duplicate_register_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "query": "mutation Register($registerInput: RegisterInput!) { register(registerInput: $registerInput) { access_token } }",
  "variables": {
    "registerInput": {
      "email": "testuser@example.com",
      "password": "password123",
      "firstName": "Duplicate",
      "lastName": "User"
    }
  }
}' $BASE_URL/graphql)
test_endpoint "Duplicate registration" '"errors"' "$duplicate_register_response"

echo "🎉 Authentication testing complete!"
echo ""
echo "📋 Available authentication endpoints:"
echo "  • Register: mutation register(registerInput: RegisterInput!)"
echo "  • Login: mutation login(loginInput: LoginInput!)"
echo "  • Current User: query me (requires authentication)"
echo ""
echo "📊 Protected Operations (require Bearer token):"
echo "  • All document queries and mutations"
echo "  • User profile access"
echo ""
echo "🔑 Authentication Flow:"
echo "  1. Register or Login to get access_token"
echo "  2. Include 'Authorization: Bearer <token>' header"
echo "  3. Access protected resources" 