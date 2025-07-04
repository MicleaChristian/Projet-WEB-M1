import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
export declare class DocumentsService {
    private prisma;
    private documentQueue;
    constructor(prisma: PrismaService, documentQueue: Queue);
    create(createDocumentInput: CreateDocumentInput, userId?: string): Promise<{
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
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
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
    findByUser(userId: string): Promise<{
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
    findOne(id: string, userId?: string): import(".prisma/client").Prisma.Prisma__DocumentClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateDocumentInput: UpdateDocumentInput): Promise<{
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
    remove(id: string): Promise<{
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
