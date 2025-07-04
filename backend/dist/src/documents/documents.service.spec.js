"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const bull_1 = require("@nestjs/bull");
const documents_service_1 = require("./documents.service");
const prisma_service_1 = require("../prisma/prisma.service");
describe('DocumentsService', () => {
    let service;
    let prismaService;
    let queue;
    const mockDocument = {
        id: '1',
        title: 'Test Document',
        content: 'Test content',
        fileName: null,
        filePath: null,
        fileSize: null,
        mimeType: null,
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockPrismaService = {
        document: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };
    const mockQueue = {
        add: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                documents_service_1.DocumentsService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: (0, bull_1.getQueueToken)('document-processing'),
                    useValue: mockQueue,
                },
            ],
        }).compile();
        service = module.get(documents_service_1.DocumentsService);
        prismaService = module.get(prisma_service_1.PrismaService);
        queue = module.get((0, bull_1.getQueueToken)('document-processing'));
        jest.clearAllMocks();
        expect(prismaService).toBeDefined();
        expect(queue).toBeDefined();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        it('should create a document and add job to queue', async () => {
            const createDocumentInput = {
                title: 'New Document',
                content: 'New content',
                userId: 'user1',
            };
            mockPrismaService.document.create.mockResolvedValue(mockDocument);
            mockQueue.add.mockResolvedValue({});
            const result = await service.create(createDocumentInput);
            expect(result).toEqual(mockDocument);
            expect(mockPrismaService.document.create).toHaveBeenCalledWith({
                data: createDocumentInput,
            });
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
            mockPrismaService.document.findMany.mockResolvedValue(documents);
            const result = await service.findAll();
            expect(result).toEqual(documents);
            expect(mockPrismaService.document.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' },
            });
        });
    });
    describe('findByUser', () => {
        it('should return documents for a specific user', async () => {
            const documents = [mockDocument];
            mockPrismaService.document.findMany.mockResolvedValue(documents);
            const result = await service.findByUser('user1');
            expect(result).toEqual(documents);
            expect(mockPrismaService.document.findMany).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                orderBy: { createdAt: 'desc' },
            });
        });
    });
    describe('findOne', () => {
        it('should return a document by id', async () => {
            mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);
            const result = await service.findOne('1');
            expect(result).toEqual(mockDocument);
            expect(mockPrismaService.document.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });
        it('should throw NotFoundException if document not found', async () => {
            mockPrismaService.document.findUnique.mockResolvedValue(null);
            await expect(service.findOne('nonexistent')).rejects.toThrow('Document not found');
        });
    });
    describe('update', () => {
        it('should update a document and add job to queue', async () => {
            const updateDocumentInput = {
                id: '1',
                title: 'Updated Document',
            };
            const updatedDocument = { ...mockDocument, title: 'Updated Document' };
            mockPrismaService.document.findUnique.mockResolvedValueOnce(mockDocument);
            mockPrismaService.document.update.mockResolvedValue(updatedDocument);
            mockQueue.add.mockResolvedValue({});
            const result = await service.update('1', updateDocumentInput, 'user1');
            expect(result).toEqual(updatedDocument);
            expect(mockPrismaService.document.findUnique).toHaveBeenCalledWith({
                where: { id: '1', userId: 'user1' }
            });
            expect(mockPrismaService.document.update).toHaveBeenCalledWith({
                where: { id: '1', userId: 'user1' },
                data: { id: '1', title: 'Updated Document' },
            });
            expect(mockQueue.add).toHaveBeenCalledWith('document-updated', {
                documentId: '1',
                action: 'UPDATE',
                userId: mockDocument.userId,
                changes: { id: '1', title: 'Updated Document' },
                timestamp: expect.any(Date),
            });
        });
        it('should throw error if document not found', async () => {
            mockPrismaService.document.findUnique.mockResolvedValue(null);
            await expect(service.update('nonexistent', { id: 'nonexistent' }, 'user1'))
                .rejects.toThrow('Document not found');
        });
    });
    describe('remove', () => {
        it('should remove a document and add job to queue', async () => {
            mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);
            mockPrismaService.document.delete.mockResolvedValue(mockDocument);
            mockQueue.add.mockResolvedValue({});
            const result = await service.remove('1', 'user1');
            expect(result).toEqual(mockDocument);
            expect(mockPrismaService.document.delete).toHaveBeenCalledWith({
                where: { id: '1', userId: 'user1' }
            });
            expect(mockQueue.add).toHaveBeenCalledWith('document-deleted', {
                documentId: '1',
                action: 'DELETE',
                userId: mockDocument.userId,
                timestamp: expect.any(Date),
            });
        });
        it('should throw error if document not found', async () => {
            mockPrismaService.document.findUnique.mockResolvedValue(null);
            await expect(service.remove('nonexistent', 'user1'))
                .rejects.toThrow('Document not found');
        });
    });
});
//# sourceMappingURL=documents.service.spec.js.map