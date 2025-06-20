#!/bin/bash

echo "🧪 Secure Document Management Platform - Endpoint Testing"
echo "=========================================================="
echo ""

BASE_URL="http://localhost:4000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

echo "3. Initial Documents Query (should be empty or have existing docs)"
docs_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"query":"{ documents { id title } }"}' $BASE_URL/graphql)
test_endpoint "Documents query" '"documents"' "$docs_response"

echo "4. Create Test Document"
create_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"query":"mutation { createDocument(createDocumentInput: { title: \"Test Doc\", content: \"Test content\", userId: \"test-user\" }) { id title } }"}' $BASE_URL/graphql)
test_endpoint "Create document" '"createDocument"' "$create_response"

# Extract document ID for further tests
DOC_ID=$(echo $create_response | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$DOC_ID" ]; then
    echo "5. Fetch Single Document by ID"
    single_doc_response=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"query\":\"{ document(id: \\\"$DOC_ID\\\") { id title } }\"}" $BASE_URL/graphql)
    test_endpoint "Single document query" '"document"' "$single_doc_response"
    
    echo "6. Update Document"
    update_response=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"query\":\"mutation { updateDocument(updateDocumentInput: { id: \\\"$DOC_ID\\\", title: \\\"Updated Title\\\" }) { id title } }\"}" $BASE_URL/graphql)
    test_endpoint "Update document" '"Updated Title"' "$update_response"
fi

echo "7. Documents by User"
user_docs_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"query":"{ documentsByUser(userId: \"test-user\") { id title } }"}' $BASE_URL/graphql)
test_endpoint "Documents by user" '"documentsByUser"' "$user_docs_response"

echo "8. Error Handling (non-existent document)"
error_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"query":"{ document(id: \"00000000-0000-0000-0000-000000000000\") { id } }"}' $BASE_URL/graphql)
test_endpoint "Error handling" '"errors"' "$error_response"

echo "9. Validation (missing fields)"
validation_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"query":"mutation { createDocument(createDocumentInput: { title: \"\" }) { id } }"}' $BASE_URL/graphql)
test_endpoint "Validation" '"errors"' "$validation_response"

echo "🎉 Endpoint testing complete!"
echo ""
echo "📋 Available endpoints:"
echo "  • Health: GET $BASE_URL/health"
echo "  • GraphQL: POST $BASE_URL/graphql"
echo "  • GraphQL Playground: $BASE_URL/graphql (in browser)"
echo ""
echo "📊 GraphQL Operations:"
echo "  Queries: documents, document(id), documentsByUser(userId)"
echo "  Mutations: createDocument, updateDocument, removeDocument" 