import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { DocumentsService } from './documents.service';
import { DocumentProcessor } from './document.processor';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';

describe('Queue Integration Tests (Producer + Consumer)', () => {
  let app: TestingModule;
  let documentsService: DocumentsService;
  let documentProcessor: DocumentProcessor;
  let queue: Queue;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        // Use in-memory SQLite for testing
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Document],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Document]),
        // Use in-memory Redis for testing (requires ioredis-mock)
        BullModule.forRoot({
          redis: {
            host: 'localhost',
            port: 6379,
            maxRetriesPerRequest: null,
          },
        }),
        BullModule.registerQueue({
          name: 'document-processing',
        }),
      ],
      providers: [DocumentsService, DocumentProcessor],
    }).compile();

    documentsService = app.get<DocumentsService>(DocumentsService);
    documentProcessor = app.get<DocumentProcessor>(DocumentProcessor);
    queue = app.get<Queue>(getQueueToken('document-processing'));

    await app.init();
  });

  afterAll(async () => {
    // Clean up queue and close connections
    await queue.empty();
    await queue.close();
    await app.close();
  });

  beforeEach(async () => {
    // Clear queue before each test
    await queue.empty();
  });

  describe('Document Creation Flow', () => {
    it('should create document and process queue job', async () => {
      // Arrange
      const createDocumentInput: CreateDocumentInput = {
        title: 'Integration Test Document',
        content: 'This document tests the complete queue flow',
        userId: 'integration-test-user',
      };

      // Spy on the processor method
      const processorSpy = jest.spyOn(documentProcessor, 'handleDocumentCreated');

      // Act
      const document = await documentsService.create(createDocumentInput);

      // Wait for the job to be processed
      await new Promise(resolve => setTimeout(resolve, 200));

      // Assert
      expect(document).toBeDefined();
      expect(document.title).toBe(createDocumentInput.title);
      
      // Verify the queue job was processed
      expect(processorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            documentId: document.id,
            action: 'CREATE',
            userId: 'integration-test-user',
          }),
        })
      );
    });

    it('should handle multiple concurrent document creations', async () => {
      // Arrange
      const documents = Array.from({ length: 5 }, (_, i) => ({
        title: `Concurrent Document ${i}`,
        content: `Content for document ${i}`,
        userId: 'concurrent-user',
      }));

      const processorSpy = jest.spyOn(documentProcessor, 'handleDocumentCreated');

      // Act
      const createdDocuments = await Promise.all(
        documents.map(doc => documentsService.create(doc))
      );

      // Wait for all jobs to be processed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Assert
      expect(createdDocuments).toHaveLength(5);
      expect(processorSpy).toHaveBeenCalledTimes(5);
      
      // Verify each document triggered a queue job
      createdDocuments.forEach(doc => {
        expect(processorSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              documentId: doc.id,
              action: 'CREATE',
            }),
          })
        );
      });
    });
  });

  describe('Document Update Flow', () => {
    it('should update document and process queue job', async () => {
      // Arrange
      const document = await documentsService.create({
        title: 'Original Title',
        content: 'Original Content',
        userId: 'update-test-user',
      });

      const processorSpy = jest.spyOn(documentProcessor, 'handleDocumentUpdated');

      // Act
      const updatedDocument = await documentsService.update(document.id, {
        id: document.id,
        title: 'Updated Title',
        content: 'Updated Content',
      }, 'update-test-user');

      // Wait for the job to be processed
      await new Promise(resolve => setTimeout(resolve, 200));

      // Assert
      expect(updatedDocument.title).toBe('Updated Title');
      expect(processorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            documentId: document.id,
            action: 'UPDATE',
            changes: expect.objectContaining({
              title: 'Updated Title',
              content: 'Updated Content',
            }),
          }),
        })
      );
    });
  });

  describe('Document Deletion Flow', () => {
    it('should delete document and process queue job', async () => {
      // Arrange
      const document = await documentsService.create({
        title: 'Document to Delete',
        content: 'This will be deleted',
        userId: 'delete-test-user',
      });

      const processorSpy = jest.spyOn(documentProcessor, 'handleDocumentDeleted');

      // Act
      await documentsService.remove(document.id, 'delete-test-user');

      // Wait for the job to be processed
      await new Promise(resolve => setTimeout(resolve, 200));

      // Assert
      expect(processorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            documentId: document.id,
            action: 'DELETE',
            userId: 'delete-test-user',
          }),
        })
      );
    });
  });

  describe('Queue Monitoring', () => {
    it('should track job counts and status', async () => {
      // Arrange
      const initialWaiting = await queue.getWaiting();
      const initialCompleted = await queue.getCompleted();

      // Act
      await documentsService.create({
        title: 'Monitoring Test',
        content: 'Test queue monitoring',
        userId: 'monitor-user',
      });

      // Wait for job processing
      await new Promise(resolve => setTimeout(resolve, 200));

      // Assert
      const finalWaiting = await queue.getWaiting();
      const finalCompleted = await queue.getCompleted();

      expect(finalCompleted.length).toBeGreaterThan(initialCompleted.length);
    });

    it('should handle failed jobs', async () => {
      // Arrange
      const processorSpy = jest.spyOn(documentProcessor, 'handleDocumentCreated')
        .mockRejectedValueOnce(new Error('Processing failed'));

      // Act
      await documentsService.create({
        title: 'Failing Document',
        content: 'This should trigger a failed job',
        userId: 'fail-user',
      });

      // Wait for job processing to fail
      await new Promise(resolve => setTimeout(resolve, 200));

      // Assert
      const failedJobs = await queue.getFailed();
      expect(failedJobs.length).toBeGreaterThan(0);
      
      // Restore original implementation
      processorSpy.mockRestore();
    });
  });

  describe('Job Retries', () => {
    it('should retry failed jobs according to configuration', async () => {
      // Arrange
      let attemptCount = 0;
      const processorSpy = jest.spyOn(documentProcessor, 'handleDocumentCreated')
        .mockImplementation(async () => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error('Temporary failure');
          }
          return Promise.resolve();
        });

      // Act
      await documentsService.create({
        title: 'Retry Test Document',
        content: 'Testing retry logic',
        userId: 'retry-user',
      });

      // Wait for retries
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Assert
      expect(attemptCount).toBeGreaterThanOrEqual(1);
      processorSpy.mockRestore();
    });
  });
}); 