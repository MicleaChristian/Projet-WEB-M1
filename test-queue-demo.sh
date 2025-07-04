#!/bin/bash

# 🔄 Démonstration des Tests de Message Queues
# Ce script démontre comment tester les producers et consumers en temps réel

set -e

echo "🔄 DÉMONSTRATION DES TESTS DE MESSAGE QUEUES"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${YELLOW}📋 Cette démonstration montre :${NC}"
echo -e "   ${BLUE}•${NC} Tests unitaires des producers et consumers"
echo -e "   ${BLUE}•${NC} Tests d'intégration avec vraie queue Redis"
echo -e "   ${BLUE}•${NC} Monitoring des jobs en temps réel"
echo -e "   ${BLUE}•${NC} Démonstration live avec GraphQL"
echo ""

# Function to wait for user input
wait_for_input() {
    echo -e "${YELLOW}Appuyez sur [ENTRÉE] pour continuer...${NC}"
    read -r
}

# Function to check if services are running
check_services() {
    echo -e "${BLUE}🔍 Vérification des services...${NC}"
    
    # Check Redis
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓ Redis running${NC}"
    else
        echo -e "   ${RED}✗ Redis not running${NC}"
        echo -e "   ${YELLOW}Veuillez lancer: docker-compose up -d redis${NC}"
        exit 1
    fi
    
    # Check if backend is running
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓ Backend running${NC}"
    else
        echo -e "   ${RED}✗ Backend not running${NC}"
        echo -e "   ${YELLOW}Veuillez lancer: ./start.sh${NC}"
        exit 1
    fi
    
    echo ""
}

# Function to run unit tests
run_unit_tests() {
    echo -e "${BLUE}🧪 ÉTAPE 1: Tests Unitaires${NC}"
    echo "================================"
    echo ""
    
    echo -e "${YELLOW}Tests du Producer (DocumentsService):${NC}"
    echo "- Teste que queue.add() est appelé avec les bonnes données"
    echo "- Mock de la queue Redis pour isolation"
    echo ""
    
    cd backend
    npm test -- --testNamePattern="DocumentsService" --verbose
    
    echo ""
    echo -e "${YELLOW}Tests du Consumer (DocumentProcessor):${NC}"
    echo "- Teste le traitement des jobs reçus"
    echo "- Vérification des logs et du temps de traitement"
    echo ""
    
    npm test -- --testNamePattern="DocumentProcessor" --verbose
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Tests unitaires terminés !${NC}"
    echo ""
}

# Function to demonstrate queue monitoring
demo_queue_monitoring() {
    echo -e "${BLUE}📊 ÉTAPE 2: Monitoring des Queues${NC}"
    echo "=================================="
    echo ""
    
    echo -e "${YELLOW}Vérification de l'état de la queue Redis:${NC}"
    echo ""
    
    # Connect to Redis and show queue keys
    echo -e "${BLUE}1. Clés de queue dans Redis:${NC}"
    redis-cli KEYS "*bull*" | head -10
    
    echo ""
    echo -e "${BLUE}2. Jobs en attente:${NC}"
    redis-cli LLEN "bull:document-processing:waiting" || echo "0"
    
    echo ""
    echo -e "${BLUE}3. Jobs actifs:${NC}"
    redis-cli LLEN "bull:document-processing:active" || echo "0"
    
    echo ""
    echo -e "${BLUE}4. Jobs complétés:${NC}"
    redis-cli LLEN "bull:document-processing:completed" || echo "0"
    
    echo ""
    echo -e "${GREEN}✅ Monitoring terminé !${NC}"
    echo ""
}

# Function to demonstrate live queue testing
demo_live_testing() {
    echo -e "${BLUE}🚀 ÉTAPE 3: Test Live avec GraphQL${NC}"
    echo "=================================="
    echo ""
    
    echo -e "${YELLOW}Nous allons maintenant:${NC}"
    echo "1. Créer un compte utilisateur"
    echo "2. Créer un document (déclenche producer)"
    echo "3. Observer les logs du consumer"
    echo "4. Vérifier les jobs dans Redis"
    echo ""
    
    wait_for_input
    
    echo -e "${BLUE}1. Création d'un compte utilisateur...${NC}"
    
    # Register user
    REGISTER_RESPONSE=$(curl -s -X POST http://localhost:4000/graphql \
        -H "Content-Type: application/json" \
        -d '{
            "query": "mutation { register(registerInput: { email: \"queuetest@example.com\", password: \"password123\", firstName: \"Queue\", lastName: \"Test\" }) { access_token user { id email } } }"
        }')
    
    echo "Response: $REGISTER_RESPONSE"
    
    # Extract token (requires jq)
    if command -v jq &> /dev/null; then
        TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.register.access_token')
    else
        echo -e "${YELLOW}jq not found, please install it for token extraction${NC}"
        echo "Using manual token extraction..."
        TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    fi
    
    if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
        echo -e "${GREEN}✓ Utilisateur créé avec succès !${NC}"
    else
        echo -e "${RED}✗ Échec de création d'utilisateur${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}2. Création d'un document (teste le producer)...${NC}"
    
    # Create document
    DOCUMENT_RESPONSE=$(curl -s -X POST http://localhost:4000/graphql \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "query": "mutation { createDocument(createDocumentInput: { title: \"Test Queue Document\", content: \"Ce document teste les message queues\" }) { id title content createdAt } }"
        }')
    
    echo "Response: $DOCUMENT_RESPONSE"
    
    # Extract document ID
    if command -v jq &> /dev/null; then
        DOCUMENT_ID=$(echo "$DOCUMENT_RESPONSE" | jq -r '.data.createDocument.id')
    else
        DOCUMENT_ID=$(echo "$DOCUMENT_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    fi
    
    if [ "$DOCUMENT_ID" != "null" ] && [ "$DOCUMENT_ID" != "" ]; then
        echo -e "${GREEN}✓ Document créé avec succès ! ID: $DOCUMENT_ID${NC}"
    else
        echo -e "${RED}✗ Échec de création du document${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}3. Vérification des logs du consumer...${NC}"
    echo -e "${YELLOW}Cherchez dans les logs du backend:${NC}"
    echo "[DocumentProcessor] Processing document creation: $DOCUMENT_ID"
    echo "[DocumentProcessor] Document creation processed successfully: $DOCUMENT_ID"
    
    echo ""
    echo -e "${BLUE}4. Vérification des jobs dans Redis...${NC}"
    
    # Check completed jobs
    COMPLETED_JOBS=$(redis-cli LLEN "bull:document-processing:completed")
    echo -e "Jobs complétés: ${GREEN}$COMPLETED_JOBS${NC}"
    
    # Check if there are any failed jobs
    FAILED_JOBS=$(redis-cli LLEN "bull:document-processing:failed" 2>/dev/null || echo "0")
    echo -e "Jobs échoués: ${RED}$FAILED_JOBS${NC}"
    
    echo ""
    echo -e "${GREEN}✅ Test live terminé !${NC}"
    echo ""
}

# Function to show test summary
show_test_summary() {
    echo -e "${BLUE}📋 RÉSUMÉ DES TESTS${NC}"
    echo "==================="
    echo ""
    
    echo -e "${YELLOW}Types de tests démontrés:${NC}"
    echo ""
    echo -e "${GREEN}✓ Tests Unitaires Producer:${NC}"
    echo "  - Mock de la queue Redis"
    echo "  - Vérification de queue.add() avec bonnes données"
    echo "  - Test des métadonnées des jobs"
    echo ""
    
    echo -e "${GREEN}✓ Tests Unitaires Consumer:${NC}"
    echo "  - Mock des jobs Bull"
    echo "  - Vérification des logs de traitement"
    echo "  - Test du temps de traitement"
    echo "  - Gestion des erreurs"
    echo ""
    
    echo -e "${GREEN}✓ Tests d'Intégration:${NC}"
    echo "  - Flux complet Producer → Redis → Consumer"
    echo "  - Vraie connexion Redis"
    echo "  - Monitoring des jobs"
    echo ""
    
    echo -e "${GREEN}✓ Tests Live:${NC}"
    echo "  - Création via GraphQL"
    echo "  - Observation des logs en temps réel"
    echo "  - Vérification Redis"
    echo ""
    
    echo -e "${YELLOW}Points clés pour la présentation:${NC}"
    echo "• Les queues permettent un traitement asynchrone"
    echo "• Producer = DocumentsService.create() → queue.add()"
    echo "• Consumer = DocumentProcessor.handleDocumentCreated()"
    echo "• Tests unitaires isolent chaque composant"
    echo "• Tests d'intégration vérifient le flux complet"
    echo "• Redis permet le monitoring en temps réel"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}🎬 Démarrage de la démonstration...${NC}"
    echo ""
    
    check_services
    wait_for_input
    
    run_unit_tests
    wait_for_input
    
    demo_queue_monitoring
    wait_for_input
    
    demo_live_testing
    wait_for_input
    
    show_test_summary
    
    echo -e "${GREEN}🎉 Démonstration terminée !${NC}"
    echo ""
    echo -e "${YELLOW}Vous êtes maintenant prêt à expliquer les tests des message queues !${NC}"
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 