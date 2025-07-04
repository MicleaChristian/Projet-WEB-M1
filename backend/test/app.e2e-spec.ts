import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Document } from '../src/documents/entities/document.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testConfig } from './test.config';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let documentRepository: Repository<Document>;
  let authToken: string;
  let testUser: User;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testConfig),
        AppModule
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    documentRepository = moduleFixture.get<Repository<Document>>(getRepositoryToken(Document));

    await app.init();

    // Clean up database - use proper criteria
    await documentRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
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
      // First register a user
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

      // Then login
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
      // Register first
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
      // Register a test user and get token
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
      // Create a document first
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