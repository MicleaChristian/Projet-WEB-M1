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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const documents_service_1 = require("./documents.service");
const fs_1 = require("fs");
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async uploadFile(file, title, content, user) {
        try {
            console.log('Upload attempt:', { file, title, content, user: user?.id });
            if (!file) {
                throw new Error('No file uploaded');
            }
            const document = await this.documentsService.create({
                title: title || file.originalname,
                content: content || 'Uploaded file',
                fileName: file.originalname,
                filePath: file.path,
                fileSize: file.size,
                mimeType: file.mimetype,
            }, user.id);
            return {
                message: 'File uploaded successfully',
                document,
                file: {
                    originalName: file.originalname,
                    filename: file.filename,
                    size: file.size,
                    mimetype: file.mimetype,
                },
            };
        }
        catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
    async test() {
        return { message: 'Documents controller is working!' };
    }
    async downloadFile(id, user, res) {
        const document = await this.documentsService.findOne(id, user.id);
        if (!document || !document.filePath) {
            throw new common_1.NotFoundException('File not found');
        }
        const filePath = document.filePath;
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.NotFoundException('File not found on disk');
        }
        res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
        res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
        return res.sendFile(filePath);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, callback) => {
                const uploadPath = (0, path_1.join)(process.cwd(), 'uploads');
                console.log('Upload destination:', uploadPath);
                callback(null, uploadPath);
            },
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const filename = `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`;
                console.log('Generated filename:', filename);
                callback(null, filename);
            },
        }),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('title')),
    __param(2, (0, common_1.Body)('content')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "test", null);
__decorate([
    (0, common_1.Get)('download/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "downloadFile", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map