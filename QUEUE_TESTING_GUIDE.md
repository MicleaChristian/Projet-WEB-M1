# 🔄 Guide de Test des Message Queues (Producer & Consumer)

## 📋 Vue d'Ensemble

Dans votre projet, les **message queues** sont utilisées pour traiter de manière asynchrone les événements liés aux documents (création, modification, suppression). Voici comment les tester efficacement.

---

## 🏗️ Architecture des Queues

### **Producer (Producteur)**
- **Service**: `DocumentsService`
- **Responsabilité**: Envoie des jobs dans la queue Redis
- **Méthodes**: `create()`, `update()`, `remove()`

### **Consumer (Consommateur)** 
- **Service**: `DocumentProcessor`
- **Responsabilité**: Traite les jobs reçus de la queue
- **Méthodes**: `handleDocumentCreated()`, `handleDocumentUpdated()`, `handleDocumentDeleted()`

### **Queue Configuration**
- **Queue Name**: `document-processing`
- **Redis**: Port 6379
- **Jobs Types**: `document-created`, `document-updated`, `document-deleted`

---

## 🧪 Types de Tests

### **1. Tests Unitaires - Producer**
Testent que les services ajoutent correctement des jobs à la queue.

### **2. Tests Unitaires - Consumer**
Testent que les processors traitent correctement les jobs reçus.

### **3. Tests d'Intégration**
Testent le flux complet: Service → Queue → Processor.

### **4. Tests Manuels**
Vérification en temps réel du fonctionnement des queues.

---

## 📝 1. Tests du Producer (déjà implémentés)

### **Fichier**: `backend/src/documents/documents.service.spec.ts`

#### **Test de Création de Document**
```typescript
it('should create a document and add job to queue', async () => {
  // Arrange
  const createDocumentInput = {
    title: 'New Document',
    content: 'New content',
    userId: 'user1',
  };

  mockRepository.create.mockReturnValue(mockDocument);
  mockRepository.save.mockResolvedValue(mockDocument);
  mockQueue.add.mockResolvedValue({});

  // Act
  const result = await service.create(createDocumentInput);

  // Assert
  expect(result).toEqual(mockDocument);
  expect(mockQueue.add).toHaveBeenCalledWith('document-created', {
    documentId: mockDocument.id,
    action: 'CREATE',
    userId: mockDocument.userId,
    timestamp: expect.any(Date),
  });
});
```

#### **Points Clés**
- ✅ Mock de la queue avec `mockQueue.add`
- ✅ Vérification que le job est ajouté avec les bonnes données
- ✅ Vérification du type de job (`document-created`)

---

## 🔄 2. Tests du Consumer

### **Créer**: `backend/src/documents/document.processor.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { DocumentProcessor } from './document.processor';

describe('DocumentProcessor (Queue Consumer)', () => {
  let processor: DocumentProcessor;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentProcessor],
    }).compile();

    processor = module.get<DocumentProcessor>(DocumentProcessor);
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  it('should process document creation job', async () => {
    // Arrange
    const jobData = {
      documentId: 'doc-123',
      action: 'CREATE',
      userId: 'user-456',
      timestamp: new Date(),
    };

    const mockJob = { data: jobData } as Job;

    // Act
    await processor.handleDocumentCreated(mockJob);

    // Assert
    expect(loggerSpy).toHaveBeenCalledWith(
      'Processing document creation: doc-123 by user user-456'
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      'Document creation processed successfully: doc-123'
    );
  });

  it('should handle processing time correctly', async () => {
    // Arrange
    const jobData = {
      documentId: 'doc-789',
      action: 'CREATE',
      userId: 'user-123',
      timestamp: new Date(),
    };

    const mockJob = { data: jobData } as Job;

    // Act
    const startTime = Date.now();
    await processor.handleDocumentCreated(mockJob);
    const endTime = Date.now();

    // Assert - Should take at least 100ms
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });
});
```

### **Points Clés**
- ✅ Mock du Logger pour vérifier les logs
- ✅ Test du temps de traitement (simulation 100ms)
- ✅ Vérification des données du job

---

## 🔗 3. Tests d'Intégration

### **Test Complet Producer → Consumer**

```typescript
// backend/src/documents/queue-integration.test.ts
describe('Queue Integration Tests', () => {
  let documentsService: DocumentsService;
  let documentProcessor: DocumentProcessor;
  let queue: Queue;

  beforeAll(async () => {
    // Setup test module with real Redis connection
    app = await Test.createTestingModule({
      imports: [
        BullModule.forRoot({
          redis: { host: 'localhost', port: 6379 },
        }),
        BullModule.registerQueue({
          name: 'document-processing',
        }),
      ],
      providers: [DocumentsService, DocumentProcessor],
    }).compile();
  });

  it('should create document and process queue job', async () => {
    // Arrange
    const createInput = {
      title: 'Integration Test',
      content: 'Testing full flow',
      userId: 'integration-user',
    };

    const processorSpy = jest.spyOn(documentProcessor, 'handleDocumentCreated');

    // Act
    const document = await documentsService.create(createInput);
    
    // Wait for async processing
    await new Promise(resolve => setTimeout(resolve, 200));

    // Assert
    expect(document).toBeDefined();
    expect(processorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          documentId: document.id,
          action: 'CREATE',
          userId: 'integration-user',
        }),
      })
    );
  });
});
```

---

## 🛠️ 4. Tests Manuels en Direct

### **Commandes de Test**

#### **1. Lancer la Plateforme**
```bash
./start.sh
```

#### **2. Ouvrir GraphQL Playground**
```
http://localhost:4000/graphql
```

#### **3. S'authentifier**
```graphql
mutation {
  register(registerInput: {
    email: "test@example.com"
    password: "password123"
    firstName: "Test"
    lastName: "User"
  }) {
    access_token
    user { id email }
  }
}
```

#### **4. Créer un Document (teste le Producer)**
```graphql
# Headers: { "Authorization": "Bearer YOUR_TOKEN" }
mutation {
  createDocument(createDocumentInput: {
    title: "Test Queue Document"
    content: "Ce document va tester les queues"
  }) {
    id
    title
    content
    createdAt
  }
}
```

#### **5. Vérifier les Logs du Consumer**
Dans les logs de votre backend, vous devriez voir :
```
[DocumentProcessor] Processing document creation: <ID> by user <USER_ID>
[DocumentProcessor] Document creation processed successfully: <ID>
```

---

## 📊 5. Monitoring des Queues

### **Vérifier l'État de la Queue**

#### **Via Code**
```typescript
// Dans votre service ou controller
async getQueueStats() {
  const waiting = await this.queue.getWaiting();
  const active = await this.queue.getActive();
  const completed = await this.queue.getCompleted();
  const failed = await this.queue.getFailed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
  };
}
```

#### **Via Redis CLI**
```bash
# Connecter à Redis
redis-cli

# Voir les clés de queue
KEYS *bull*

# Voir les jobs en attente
LLEN "bull:document-processing:waiting"

# Voir les jobs actifs
LLEN "bull:document-processing:active"
```

---

## 🔍 6. Tests de Performance

### **Test de Charge**
```typescript
it('should handle multiple concurrent jobs', async () => {
  // Arrange
  const documents = Array.from({ length: 10 }, (_, i) => ({
    title: `Load Test Document ${i}`,
    content: `Content ${i}`,
    userId: 'load-test-user',
  }));

  // Act
  const startTime = Date.now();
  await Promise.all(
    documents.map(doc => documentsService.create(doc))
  );
  const endTime = Date.now();

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Assert
  console.log(`Created 10 documents in ${endTime - startTime}ms`);
  
  const completed = await queue.getCompleted();
  expect(completed.length).toBeGreaterThanOrEqual(10);
});
```

---

## 🚨 7. Tests d'Erreur

### **Test de Gestion d'Erreur**
```typescript
it('should handle processor failures', async () => {
  // Arrange
  const processorSpy = jest.spyOn(documentProcessor, 'handleDocumentCreated')
    .mockRejectedValueOnce(new Error('Processing failed'));

  // Act
  await documentsService.create({
    title: 'Failing Document',
    content: 'This should fail',
    userId: 'fail-user',
  });

  // Wait for failure
  await new Promise(resolve => setTimeout(resolve, 200));

  // Assert
  const failedJobs = await queue.getFailed();
  expect(failedJobs.length).toBeGreaterThan(0);
});
```

---

## 🧪 8. Commandes de Test Utiles

### **Tests Automatisés**
```bash
# Tests unitaires
cd backend
npm test

# Tests spécifiques aux queues
npm test -- --testNamePattern="queue"

# Tests avec couverture
npm run test:cov
```

### **Tests Manuels GraphQL**
```bash
# Script de test complet
./test-auth-endpoints.sh

# Test de création de documents
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "mutation { createDocument(createDocumentInput: { title: \"Queue Test\", content: \"Testing queues\" }) { id title } }"
  }'
```

---

## 🎯 9. Points Clés pour la Présentation

### **Quand le Prof Demande "Comment testez-vous les queues ?"**

#### **1. Tests Unitaires**
- "On teste le **producer** en mockant la queue et vérifiant que `queue.add()` est appelé"
- "On teste le **consumer** en mockant les jobs et vérifiant le traitement"

#### **2. Tests d'Intégration**
- "On teste le flux complet avec une vraie connexion Redis"
- "On vérifie que créer un document déclenche bien le processor"

#### **3. Monitoring**
- "On peut monitorer les jobs : waiting, active, completed, failed"
- "Les logs montrent le traitement en temps réel"

#### **4. Démonstration Live**
- "Je peux créer un document via GraphQL et montrer les logs du processor"
- "Les jobs sont visibles dans Redis CLI"

### **Code à Montrer**
1. **Producer**: `documentsService.create()` avec `this.documentQueue.add()`
2. **Consumer**: `@Process('document-created')` dans `DocumentProcessor`
3. **Test**: Vérification de `mockQueue.add` avec les bonnes données
4. **Logs**: Traitement en temps réel visible

---

## 🚀 10. Checklist de Test

### **Avant la Présentation**
- [ ] Lancer `./start.sh`
- [ ] Vérifier Redis : `redis-cli ping`
- [ ] Tester création document via GraphQL
- [ ] Vérifier logs du processor
- [ ] Préparer exemple de test unitaire

### **Pendant la Démonstration**
- [ ] Montrer le code du producer
- [ ] Montrer le code du consumer  
- [ ] Expliquer les tests unitaires
- [ ] Démonstration live GraphQL → logs
- [ ] Expliquer le monitoring des jobs

---

**✨ Avec ces tests, vous démontrez une maîtrise complète des message queues !** 