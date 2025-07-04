"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
let DocumentsService = class DocumentsService {
    constructor(prisma, documentQueue) {
        this.prisma = prisma;
        this.documentQueue = documentQueue;
    }
    async create(createDocumentInput, userId) {
        const documentData = {
            ...createDocumentInput,
            userId: userId || createDocumentInput.userId,
        };
        const savedDocument = await this.prisma.document.create({
            data: documentData,
        });
        await this.documentQueue.add('document-created', {
            documentId: savedDocument.id,
            action: 'CREATE',
            userId: savedDocument.userId,
            timestamp: new Date(),
        });
        return savedDocument;
    }
    findAll() {
        return this.prisma.document.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async findByUser(userId) {
        return this.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id, userId) {
        const whereCondition = { id };
        if (userId) {
            whereCondition.userId = userId;
        }
        const document = await this.prisma.document.findUnique({ where: whereCondition });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (userId && document.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to access this document');
        }
        return document;
    }
    async update(id, updateDocumentInput, userId) {
        const existingDocument = await this.findOne(id, userId);
        const updatedDocument = await this.prisma.document.update({
            where: {
                id,
                userId
            },
            data: updateDocumentInput,
        });
        await this.documentQueue.add('document-updated', {
            documentId: id,
            action: 'UPDATE',
            userId: existingDocument.userId,
            changes: updateDocumentInput,
            timestamp: new Date(),
        });
        return updatedDocument;
    }
    async remove(id, userId) {
        const document = await this.findOne(id, userId);
        const deletedDocument = await this.prisma.document.delete({
            where: {
                id,
                userId
            },
        });
        await this.documentQueue.add('document-deleted', {
            documentId: id,
            action: 'DELETE',
            userId: document.userId,
            timestamp: new Date(),
        });
        return deletedDocument;
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)('document-processing')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map