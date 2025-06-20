import { Response } from 'express';
import { User } from '../users/entities/user.entity';
import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadFile(file: Express.Multer.File, title: string, content: string, user: User): Promise<{
        message: string;
        document: import("./entities/document.entity").Document;
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
