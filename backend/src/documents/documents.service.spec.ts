import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let repository: Repository<Document>;
  let queue: Queue;

  const mockDocument: Document = {
    id: '1',
    title: 'Test Document',
    content: 'Test content',
    fileName: undefined,
    filePath: undefined,
    fileSize: undefined,
    mimeType: undefined,
    userId: 'user1',
    user: null as any, // Mock user object
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockRepository,
        },
        {
          provide: getQueueToken('document-processing'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    repository = module.get<Repository<Document>>(getRepositoryToken(Document));
    queue = module.get<Queue>(getQueueToken('document-processing'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a document and add job to queue', async () => {
      const createDocumentInput: CreateDocumentInput = {
        title: 'New Document',
        content: 'New content',
        userId: 'user1',
      };

      mockRepository.create.mockReturnValue(mockDocument);
      mockRepository.save.mockResolvedValue(mockDocument);
      mockQueue.add.mockResolvedValue({});

      const result = await service.create(createDocumentInput);

      expect(result).toEqual(mockDocument);
      expect(mockRepository.create).toHaveBeenCalledWith(createDocumentInput);
      expect(mockRepository.save).toHaveBeenCalledWith(mockDocument);
      expect(mockQueue.add).toHaveBeenCalledWith('document-created', {
        documentId: mockDocument.id,
        action: 'CREATE',
        userId: mockDocument.userId,
        timestamp: expect.any(Date),
      });
    });
  });

  describe('findAll', () => {
    it('should return all documents', async () => {
      const documents = [mockDocument];
      mockRepository.find.mockResolvedValue(documents);

      const result = await service.findAll();

      expect(result).toEqual(documents);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return documents for a specific user', async () => {
      const documents = [mockDocument];
      mockRepository.find.mockResolvedValue(documents);

      const result = await service.findByUser('user1');

      expect(result).toEqual(documents);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findOne('1');

      expect(result).toEqual(mockDocument);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a document and add job to queue', async () => {
      const updateDocumentInput: UpdateDocumentInput = {
        id: '1',
        title: 'Updated Document',
      };

      const updatedDocument = { ...mockDocument, title: 'Updated Document' };
      mockRepository.findOne.mockResolvedValueOnce(mockDocument);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(updatedDocument);
      mockQueue.add.mockResolvedValue({});

      const result = await service.update('1', updateDocumentInput);

      expect(result).toEqual(updatedDocument);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.update).toHaveBeenCalledWith('1', updateDocumentInput);
      expect(mockQueue.add).toHaveBeenCalledWith('document-updated', {
        documentId: '1',
        action: 'UPDATE',
        userId: mockDocument.userId,
        changes: updateDocumentInput,
        timestamp: expect.any(Date),
      });
    });

    it('should throw error if document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', { id: 'nonexistent' }))
        .rejects.toThrow('Document not found');
    });
  });

  describe('remove', () => {
    it('should remove a document and add job to queue', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      mockQueue.add.mockResolvedValue({});

      const result = await service.remove('1');

      expect(result).toEqual(mockDocument);
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(mockQueue.add).toHaveBeenCalledWith('document-deleted', {
        documentId: '1',
        action: 'DELETE',
        userId: mockDocument.userId,
        timestamp: expect.any(Date),
      });
    });

    it('should throw error if document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent'))
        .rejects.toThrow('Document not found');
    });
  });
});
 