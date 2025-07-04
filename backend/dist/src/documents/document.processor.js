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
var DocumentProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
let DocumentProcessor = DocumentProcessor_1 = class DocumentProcessor {
    constructor() {
        this.logger = new common_1.Logger(DocumentProcessor_1.name);
    }
    async handleDocumentCreated(job) {
        const { documentId, userId } = job.data;
        this.logger.log(`Processing document creation: ${documentId} by user ${userId}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        this.logger.log(`Document creation processed successfully: ${documentId}`);
    }
    async handleDocumentUpdated(job) {
        const { documentId, userId } = job.data;
        this.logger.log(`Processing document update: ${documentId} by user ${userId}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        this.logger.log(`Document update processed successfully: ${documentId}`);
    }
    async handleDocumentDeleted(job) {
        const { documentId, userId } = job.data;
        this.logger.log(`Processing document deletion: ${documentId} by user ${userId}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        this.logger.log(`Document deletion processed successfully: ${documentId}`);
    }
};
exports.DocumentProcessor = DocumentProcessor;
__decorate([
    (0, bull_1.Process)('document-created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentProcessor.prototype, "handleDocumentCreated", null);
__decorate([
    (0, bull_1.Process)('document-updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentProcessor.prototype, "handleDocumentUpdated", null);
__decorate([
    (0, bull_1.Process)('document-deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentProcessor.prototype, "handleDocumentDeleted", null);
exports.DocumentProcessor = DocumentProcessor = DocumentProcessor_1 = __decorate([
    (0, bull_1.Processor)('document-processing')
], DocumentProcessor);
//# sourceMappingURL=document.processor.js.map