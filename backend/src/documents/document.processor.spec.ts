import { Test, TestingModule } from '@nestjs/testing';
import { DocumentProcessor } from './document.processor';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

interface DocumentJobData {
  documentId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  userId: string;
  timestamp: Date;
  changes?: Record<string, unknown>;
}

describe('DocumentProcessor', () => {
  let processor: DocumentProcessor;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentProcessor],
    }).compile();

    processor = module.get<DocumentProcessor>(DocumentProcessor);
    
    // Mock Logger to verify logging behavior
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handleDocumentCreated', () => {
    it('should process document creation job successfully', async () => {
      const jobData: DocumentJobData = {
        documentId: 'doc-123',
        action: 'CREATE',
        userId: 'user-123',
        timestamp: new Date(),
      };

      const mockJob = {
        data: jobData,
        id: 1,
        opts: {},
      } as Job<DocumentJobData>;

      await processor.handleDocumentCreated(mockJob);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Processing document creation: doc-123 by user user-123'
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        'Document creation processed successfully: doc-123'
      );
    });

    it('should handle job processing time', async () => {
      const jobData: DocumentJobData = {
        documentId: 'doc-789',
        action: 'CREATE',
        userId: 'user-123',
        timestamp: new Date(),
      };

      const mockJob = {
        data: jobData,
      } as Job<DocumentJobData>;

      const startTime = Date.now();
      await processor.handleDocumentCreated(mockJob);
      const endTime = Date.now();

      // Should take at least 100ms (simulated processing time)
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });

  describe('handleDocumentUpdated', () => {
    it('should process document update job successfully', async () => {
      const jobData: DocumentJobData = {
        documentId: 'doc-456',
        action: 'UPDATE',
        userId: 'user-789',
        timestamp: new Date(),
        changes: { title: 'New Title', content: 'Updated content' },
      };

      const mockJob = {
        data: jobData,
      } as Job<DocumentJobData>;

      await processor.handleDocumentUpdated(mockJob);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Processing document update: doc-456 by user user-789'
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        'Document update processed successfully: doc-456'
      );
    });

    it('should process job with changes metadata', async () => {
      const changes = { 
        title: 'Updated Title',
        content: 'Updated Content',
        lastModified: new Date().toISOString()
      };

      const jobData: DocumentJobData = {
        documentId: 'doc-update-123',
        action: 'UPDATE',
        userId: 'user-update-456',
        timestamp: new Date(),
        changes,
      };

      const mockJob = {
        data: jobData,
      } as Job<DocumentJobData>;

      await processor.handleDocumentUpdated(mockJob);

      // Verify job contains change metadata
      expect(mockJob.data.changes).toEqual(changes);
    });
  });

  describe('handleDocumentDeleted', () => {
    it('should process document deletion job successfully', async () => {
      const jobData: DocumentJobData = {
        documentId: 'doc-to-delete',
        action: 'DELETE',
        userId: 'user-deleter',
        timestamp: new Date(),
      };

      const mockJob = {
        data: jobData,
      } as Job<DocumentJobData>;

      await processor.handleDocumentDeleted(mockJob);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Processing document deletion: doc-to-delete by user user-deleter'
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        'Document deletion processed successfully: doc-to-delete'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Mock Logger.log to throw an error
      loggerSpy.mockImplementationOnce(() => {
        throw new Error('Logging failed');
      });

      const jobData: DocumentJobData = {
        documentId: 'error-doc',
        action: 'CREATE',
        userId: 'error-user',
        timestamp: new Date(),
      };

      const mockJob = {
        data: jobData,
      } as Job<DocumentJobData>;

      await expect(
        processor.handleDocumentCreated(mockJob)
      ).rejects.toThrow('Logging failed');
    });
  });

  describe('Job Data Validation', () => {
    it('should handle missing job data fields', async () => {
      const incompleteJobData = {
        documentId: 'doc-incomplete',
        // Missing required fields: action, userId, timestamp
      } as DocumentJobData;

      const mockJob = {
        data: incompleteJobData,
      } as Job<DocumentJobData>;

      await processor.handleDocumentCreated(mockJob);

      // Should still process but with undefined values
      expect(loggerSpy).toHaveBeenCalledWith(
        'Processing document creation: doc-incomplete by user undefined'
      );
    });
  });
}); 