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
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const typeorm_2 = require("typeorm");
const document_entity_1 = require("./entities/document.entity");
let DocumentsService = class DocumentsService {
    constructor(documentsRepository, documentQueue) {
        this.documentsRepository = documentsRepository;
        this.documentQueue = documentQueue;
    }
    async create(createDocumentInput, userId) {
        const documentData = {
            ...createDocumentInput,
            userId: userId || createDocumentInput.userId,
        };
        const document = this.documentsRepository.create(documentData);
        const savedDocument = await this.documentsRepository.save(document);
        await this.documentQueue.add('document-created', {
            documentId: savedDocument.id,
            action: 'CREATE',
            userId: savedDocument.userId,
            timestamp: new Date(),
        });
        return savedDocument;
    }
    findAll() {
        return this.documentsRepository.find({
            order: { createdAt: 'DESC' }
        });
    }
    async findByUser(userId) {
        return this.documentsRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });
    }
    findOne(id, userId) {
        const whereCondition = { id };
        if (userId) {
            whereCondition.userId = userId;
        }
        return this.documentsRepository.findOne({ where: whereCondition });
    }
    async update(id, updateDocumentInput) {
        const existingDocument = await this.findOne(id);
        if (!existingDocument) {
            throw new Error('Document not found');
        }
        await this.documentsRepository.update(id, updateDocumentInput);
        const updatedDocument = await this.findOne(id);
        await this.documentQueue.add('document-updated', {
            documentId: id,
            action: 'UPDATE',
            userId: existingDocument.userId,
            changes: updateDocumentInput,
            timestamp: new Date(),
        });
        return updatedDocument;
    }
    async remove(id) {
        const document = await this.findOne(id);
        if (!document) {
            throw new Error('Document not found');
        }
        await this.documentsRepository.delete(id);
        await this.documentQueue.add('document-deleted', {
            documentId: id,
            action: 'DELETE',
            userId: document.userId,
            timestamp: new Date(),
        });
        return document;
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __param(1, (0, bull_1.InjectQueue)('document-processing')),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map