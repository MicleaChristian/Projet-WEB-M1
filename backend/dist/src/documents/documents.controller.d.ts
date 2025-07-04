import { Response } from 'express';
import { User } from '@prisma/client';
import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadFile(file: Express.Multer.File, title: string, content: string, user: User): Promise<{
        message: string;
        document: {
            title: string;
            content: string;
            fileName: string | null;
            filePath: string | null;
            fileSize: number | null;
            mimeType: string | null;
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        file: {
            originalName: string;
            filename: string;
            size: number;
            mimetype: string;
        };
    }>;
    test(): Promise<{
        message: string;
    }>;
    downloadFile(id: string, user: User, res: Response): Promise<void>;
}
