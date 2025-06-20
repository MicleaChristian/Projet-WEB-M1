"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../src/users/entities/user.entity");
const document_entity_1 = require("../src/documents/entities/document.entity");
describe('AppController (e2e)', () => {
    let app;
    let userRepository;
    let documentRepository;
    let authToken;
    let testUser;
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        userRepository = moduleFixture.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        documentRepository = moduleFixture.get((0, typeorm_1.getRepositoryToken)(document_entity_1.Document));
        await app.init();
        await documentRepository.delete({});
        await userRepository.delete({});
    });
    afterEach(async () => {
        await app.close();
    });
    describe('Health Check', () => {
        it('/health (GET)', () => {
            return request(app.getHttpServer())
                .get('/health')
                .expect(200)
                .expect('OK');
        });
    });
    describe('Authentication', () => {
        it('should register a new user', async () => {
            const registerInput = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            };
            const response = await request(app.getHttpServer())
                .post('/graphql')
                .send({
                query: `
            mutation Register($registerInput: RegisterInput!) {
              register(registerInput: $registerInput) {
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
          `,
                variables: { registerInput },
            })
                .expect(200);
            expect(response.body.data.register).toBeDefined();
            expect(response.body.data.register.access_token).toBeDefined();
            expect(response.body.data.register.user.email).toBe('test@example.com');
            authToken = response.body.data.register.access_token;
            testUser = response.body.data.register.user;
        });
        it('should login with valid credentials', async () => {
            await request(app.getHttpServer())
                .post('/graphql')
                .send({
                query: `
            mutation Register($registerInput: RegisterInput!) {
              register(registerInput: $registerInput) {
                access_token
              }
            }
          `,
                variables: {
                    registerInput: {
                        email: 'login@example.com',
                        password: 'password123',
                        firstName: 'Login',
                        lastName: 'User',
                    },
                },
            });
            const response = await request(app.getHttpServer())
                .post('/graphql')
                .send({
                query: `
            mutation Login($loginInput: LoginInput!) {
              login(loginInput: $loginInput) {
                access_token
                user {
                  email
                }
              }
            }
          `,
                variables: {
                    loginInput: {
                        email: 'login@example.com',
                        password: 'password123',
                    },
                },
            })
                .expect(200);
            expect(response.body.data.login).toBeDefined();
            expect(response.body.data.login.access_token).toBeDefined();
        });
        it('should get current user with valid token', async () => {
            const registerResponse = await request(app.getHttpServer())
                .post('/graphql')
                .send({
                query: `
            mutation Register($registerInput: RegisterInput!) {
              register(registerInput: $registerInput) {
                access_token
              }
            }
          `,
                variables: {
                    registerInput: {
                        email: 'me@example.com',
                        password: 'password123',
                        firstName: 'Me',
                        lastName: 'User',
                    },
                },
            });
            const token = registerResponse.body.data.register.access_token;
            const response = await request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                query: `
            query {
              me {
                email
                firstName
                lastName
              }
            }
          `,
            })
                .expect(200);
            expect(response.body.data.me).toBeDefined();
            expect(response.body.data.me.email).toBe('me@example.com');
        });
    });
    describe('Document Management', () => {
        beforeEach(async () => {
            const registerResponse = await request(app.getHttpServer())
                .post('/graphql')
                .send({
                query: `
            mutation Register($registerInput: RegisterInput!) {
              register(registerInput: $registerInput) {
                access_token
                user {
                  id
                }
              }
            }
          `,
                variables: {
                    registerInput: {
                        email: 'doctest@example.com',
                        password: 'password123',
                        firstName: 'Doc',
                        lastName: 'Test',
                    },
                },
            });
            authToken = registerResponse.body.data.register.access_token;
            testUser = registerResponse.body.data.register.user;
        });
        it('should create a document', async () => {
            const response = await request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                query: `
            mutation CreateDocument($createDocumentInput: CreateDocumentInput!) {
              createDocument(createDocumentInput: $createDocumentInput) {
                id
                title
                content
                userId
              }
            }
          `,
                variables: {
                    createDocumentInput: {
                        title: 'Test Document',
                        content: 'This is test content',
                    },
                },
            })
                .expect(200);
            expect(response.body.data.createDocument).toBeDefined();
            expect(response.body.data.createDocument.title).toBe('Test Document');
            expect(response.body.data.createDocument.userId).toBe(testUser.id);
        });
        it('should get user documents', async () => {
            await request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                query: `
            mutation CreateDocument($createDocumentInput: CreateDocumentInput!) {
              createDocument(createDocumentInput: $createDocumentInput) {
                id
              }
            }
          `,
                variables: {
                    createDocumentInput: {
                        title: 'Test Document',
                        content: 'This is test content',
                    },
                },
            });
            const response = await request(app.getHttpServer())
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                query: `
            query {
              documents {
                id
                title
                content
                userId
              }
            }
          `,
            })
                .expect(200);
            expect(response.body.data.documents).toBeDefined();
            expect(response.body.data.documents.length).toBeGreaterThan(0);
        });
        it('should require authentication for document operations', async () => {
            const response = await request(app.getHttpServer())
                .post('/graphql')
                .send({
                query: `
            query {
              documents {
                id
                title
              }
            }
          `,
            })
                .expect(200);
            expect(response.body.errors).toBeDefined();
            expect(response.body.errors[0].message).toContain('Unauthorized');
        });
    });
});
//# sourceMappingURL=app.e2e-spec.js.map