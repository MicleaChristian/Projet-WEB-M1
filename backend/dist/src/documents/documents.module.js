"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const platform_express_1 = require("@nestjs/platform-express");
const documents_service_1 = require("./documents.service");
const documents_resolver_1 = require("./documents.resolver");
const documents_controller_1 = require("./documents.controller");
const document_processor_1 = require("./document.processor");
let DocumentsModule = class DocumentsModule {
};
exports.DocumentsModule = DocumentsModule;
exports.DocumentsModule = DocumentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({
                name: 'document-processing',
            }),
            platform_express_1.MulterModule.register({
                dest: './uploads',
            }),
        ],
        controllers: [documents_controller_1.DocumentsController],
        providers: [documents_resolver_1.DocumentsResolver, documents_service_1.DocumentsService, document_processor_1.DocumentProcessor],
        exports: [documents_service_1.DocumentsService],
    })
], DocumentsModule);
//# sourceMappingURL=documents.module.js.map