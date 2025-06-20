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
exports.DocumentsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const documents_service_1 = require("./documents.service");
const document_entity_1 = require("./entities/document.entity");
const create_document_input_1 = require("./dto/create-document.input");
const update_document_input_1 = require("./dto/update-document.input");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let DocumentsResolver = class DocumentsResolver {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async createDocument(createDocumentInput, user) {
        const documentData = { ...createDocumentInput, userId: user.id };
        return this.documentsService.create(documentData);
    }
    async findAll(user) {
        return this.documentsService.findByUser(user.id);
    }
    async findByUser(user) {
        return this.documentsService.findByUser(user.id);
    }
    async findOne(id, user) {
        const document = await this.documentsService.findOne(id);
        if (!document) {
            throw new Error(`Document with ID ${id} not found`);
        }
        if (user.role !== 'admin' && document.userId !== user.id) {
            throw new Error('Unauthorized access to document');
        }
        return document;
    }
    async updateDocument(updateDocumentInput, user) {
        const document = await this.documentsService.findOne(updateDocumentInput.id);
        if (!document) {
            throw new Error(`Document with ID ${updateDocumentInput.id} not found`);
        }
        if (user.role !== 'admin' && document.userId !== user.id) {
            throw new Error('Unauthorized access to document');
        }
        return this.documentsService.update(updateDocumentInput.id, updateDocumentInput);
    }
    async removeDocument(id, user) {
        const document = await this.documentsService.findOne(id);
        if (!document) {
            throw new Error(`Document with ID ${id} not found`);
        }
        if (user.role !== 'admin' && document.userId !== user.id) {
            throw new Error('Unauthorized access to document');
        }
        return this.documentsService.remove(id);
    }
};
exports.DocumentsResolver = DocumentsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => document_entity_1.Document),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('createDocumentInput')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_document_input_1.CreateDocumentInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], DocumentsResolver.prototype, "createDocument", null);
__decorate([
    (0, graphql_1.Query)(() => [document_entity_1.Document], { name: 'documents' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], DocumentsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => [document_entity_1.Document], { name: 'documentsByUser' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], DocumentsResolver.prototype, "findByUser", null);
__decorate([
    (0, graphql_1.Query)(() => document_entity_1.Document, { name: 'document' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], DocumentsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => document_entity_1.Document),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('updateDocumentInput')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_document_input_1.UpdateDocumentInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], DocumentsResolver.prototype, "updateDocument", null);
__decorate([
    (0, graphql_1.Mutation)(() => document_entity_1.Document),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], DocumentsResolver.prototype, "removeDocument", null);
exports.DocumentsResolver = DocumentsResolver = __decorate([
    (0, graphql_1.Resolver)(() => document_entity_1.Document),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsResolver);
//# sourceMappingURL=documents.resolver.js.map