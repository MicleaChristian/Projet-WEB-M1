import { User } from '../../users/entities/user.entity';
export declare class Document {
    id: string;
    title: string;
    content: string;
    fileName?: string;
    filePath?: string;
    fileSize?: number;
    mimeType?: string;
    userId: string;
    user?: User;
    createdAt: Date;
    updatedAt: Date;
}
