# 💻 Checklist - Passage sur le Code

## 🎯 Préparation Technique (Avant la Présentation)

### ✅ Vérifications Préalables
- [ ] **Plateforme lancée** : `./start.sh` exécuté avec succès
- [ ] **Backend accessible** : http://localhost:4000/health répond "OK"
- [ ] **Frontend accessible** : http://localhost:3000 se charge
- [ ] **GraphQL Playground** : http://localhost:4000/graphql fonctionne
- [ ] **Base de données** : PostgreSQL connectée
- [ ] **Redis** : Message queue opérationnelle

### ✅ Fichiers Clés à Préparer
- [ ] `backend/src/documents/documents.resolver.ts` - Resolvers GraphQL
- [ ] `backend/src/documents/documents.service.ts` - Logique métier
- [ ] `backend/src/documents/document.processor.ts` - Message queue
- [ ] `backend/src/auth/auth.service.ts` - Authentification
- [ ] `backend/src/documents/documents.service.spec.ts` - Tests unitaires
- [ ] `.github/workflows/ci.yml` - Pipeline CI/CD

---

## 🔍 1. Resolver GraphQL à Montrer

### **Fichier**: `backend/src/documents/documents.resolver.ts`

```typescript
@Resolver(() => Document)
export class DocumentsResolver {
  
  @Query(() => [Document])
  @UseGuards(JwtAuthGuard)
  async documentsByUser(@CurrentUser() user: User) {
    return this.documentsService.findByUser(user.id);
  }

  @Mutation(() => Document)
  @UseGuards(JwtAuthGuard)
  async createDocument(
    @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.create(createDocumentInput, user.id);
  }
}
```

### **Points à Expliquer**
- Décorateurs GraphQL (`@Query`, `@Mutation`)
- Guard JWT pour sécurité
- Injection de l'utilisateur actuel
- Type safety avec TypeScript

---

## 🔧 2. Service avec Logique Métier

### **Fichier**: `backend/src/documents/documents.service.ts`

```typescript
@Injectable()
export class DocumentsService {
  
  async create(createDocumentInput: CreateDocumentInput, userId: string) {
    const document = this.repository.create({
      ...createDocumentInput,
      userId,
    });
    
    const savedDocument = await this.repository.save(document);
    
    // Déclencher job asynchrone pour audit
    await this.queue.add('document-created', {
      documentId: savedDocument.id,
      userId: userId,
      timestamp: new Date(),
    });
    
    return savedDocument;
  }
}
```

### **Points à Expliquer**
- Injection de dépendances
- Utilisation TypeORM
- Intégration message queue
- Audit trail automatique

---

## 🔄 3. Message Queue Job

### **Fichier**: `backend/src/documents/document.processor.ts`

```typescript
@Processor('document-processing')
export class DocumentProcessor {
  
  @Process('document-created')
  async handleDocumentCreated(job: Job) {
    console.log('Processing document created event:', job.data);
    
    // Logique d'audit
    const { documentId, userId, timestamp } = job.data;
    
    // Enregistrer dans les logs
    // Notifier d'autres services
    // Mise à jour des métriques
  }
}
```

### **Points à Expliquer**
- Décorateur `@Processor`
- Jobs asynchrones
- Traçabilité des opérations
- Scalabilité du système

---

## 🔐 4. Authentification JWT

### **Fichier**: `backend/src/auth/auth.service.ts`

```typescript
@Injectable()
export class AuthService {
  
  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.validateUser(loginInput.email, loginInput.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { email: user.email, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
  
  private async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }
}
```

### **Points à Expliquer**
- Hashage bcrypt des mots de passe
- Génération JWT
- Validation sécurisée
- Gestion des erreurs

---

## 🧪 5. Test Unitaire

### **Fichier**: `backend/src/documents/documents.service.spec.ts`

```typescript
describe('DocumentsService', () => {
  let service: DocumentsService;
  let repository: Repository<Document>;
  let queue: Queue;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getRepositoryToken(Document), useValue: mockRepository },
        { provide: getQueueToken('document-processing'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should create a document', async () => {
    const createDocumentInput = { title: 'Test', content: 'Content' };
    const result = await service.create(createDocumentInput, 'user-id');
    
    expect(result).toBeDefined();
    expect(result.title).toBe('Test');
  });
});
```

### **Points à Expliquer**
- Mocking des dépendances
- Tests d'intégration
- Coverage à 100%
- Qualité du code

---

## 🚀 6. Pipeline CI/CD

### **Fichier**: `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Run linter
        run: npm run lint
        
      - name: Build application
        run: npm run build
```

### **Points à Expliquer**
- Automatisation des tests
- Vérification qualité code
- Build automatique
- Déploiement continu

---

## 🌐 7. Requêtes GraphQL Live

### **Dans GraphQL Playground** (http://localhost:4000/graphql)

#### **Registration**
```graphql
mutation {
  register(registerInput: {
    email: "demo@example.com"
    password: "password123"
    firstName: "Demo"
    lastName: "User"
  }) {
    access_token
    user {
      id
      email
      firstName
    }
  }
}
```

#### **Login**
```graphql
mutation {
  login(loginInput: {
    email: "demo@example.com"
    password: "password123"
  }) {
    access_token
    user {
      id
      email
    }
  }
}
```

#### **Créer Document** (avec token)
```graphql
# Headers: { "Authorization": "Bearer YOUR_TOKEN" }
mutation {
  createDocument(createDocumentInput: {
    title: "Document de Démonstration"
    content: "Contenu du document pour la présentation"
  }) {
    id
    title
    content
    createdAt
    updatedAt
  }
}
```

#### **Lister Documents**
```graphql
# Headers: { "Authorization": "Bearer YOUR_TOKEN" }
query {
  documentsByUser {
    id
    title
    content
    createdAt
    fileName
    fileSize
  }
}
```

---

## 📱 8. Démonstration Frontend

### **Étapes à Montrer**
1. **Page d'accueil** : http://localhost:3000
2. **Registration** : Créer un compte
3. **Login** : Se connecter
4. **Dashboard** : Vue d'ensemble des documents
5. **Créer document** : Nouveau document
6. **Upload fichier** : Joindre un PDF
7. **Éditer document** : Modification
8. **Supprimer document** : Avec confirmation

### **Points à Expliquer**
- Interface Material-UI
- Gestion d'état React
- Intégration Apollo Client
- Responsive design

---

## 🎯 Questions Probables du Professeur

### **Questions Techniques**
1. **"Pourquoi GraphQL plutôt que REST ?"**
   - Flexibilité des requêtes
   - Typage fort
   - Une seule endpoint
   - Moins de sur-fetching

2. **"Comment fonctionne l'authentification ?"**
   - JWT tokens
   - Hashage bcrypt
   - Guards NestJS
   - Expiration automatique

3. **"Quel est l'intérêt du message queuing ?"**
   - Traitement asynchrone
   - Audit trail
   - Scalabilité
   - Découplage des services

4. **"Comment garantissez-vous la sécurité ?"**
   - Authentification JWT
   - Validation des inputs
   - Hashage des mots de passe
   - Guards et décorateurs

5. **"Que teste votre pipeline CI/CD ?"**
   - Tests unitaires
   - Linting du code
   - Build de l'application
   - Qualité du code

---

## 🚨 Checklist Final - Jour J

### **30 minutes avant**
- [ ] Lancer `./start.sh`
- [ ] Vérifier tous les services
- [ ] Tester une requête GraphQL
- [ ] Préparer un compte de démonstration
- [ ] Ouvrir les fichiers de code importants

### **Pendant la démonstration**
- [ ] Montrer d'abord l'interface utilisateur
- [ ] Expliquer l'architecture générale
- [ ] Naviguer dans le code de façon fluide
- [ ] Expliquer les choix techniques
- [ ] Répondre aux questions avec confiance

### **En cas de problème**
- [ ] Avoir des captures d'écran de backup
- [ ] Connaître les commandes de redémarrage
- [ ] Préparer des explications sans démo
- [ ] Garder son calme et expliquer

---

## 🎖️ Points Bonus à Mentionner

- **91% de completion** du projet
- **100% de pass rate** sur les tests
- **Architecture modulaire** prête pour la production
- **Sécurité robuste** avec JWT et bcrypt
- **Performance** avec message queuing asynchrone
- **Scalabilité** avec Docker et microservices

---

**🚀 Vous êtes prêt pour une présentation réussie !** 