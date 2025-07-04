import { DocumentsService } from './documents.service';
import { CreateDocumentInput } from './dto/create-document.input';
import { User } from '@prisma/client';
import { UpdateDocumentInput } from './dto/update-document.input';
export declare class DocumentsResolver {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    createDocument(createDocumentInput: CreateDocumentInput, user: User): Promise<{
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
    }>;
    findAll(user: User): Promise<{
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
    }[]>;
    findByUser(user: User): Promise<{
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
    }[]>;
    findOne(id: string, user: User): Promise<{
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
    }>;
    updateDocument(updateDocumentInput: UpdateDocumentInput, user: User): Promise<{
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
    }>;
    removeDocument(id: string, user: User): Promise<{
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
    }>;
}
