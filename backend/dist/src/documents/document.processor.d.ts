import { Job } from 'bull';
interface DocumentJobData {
    documentId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    userId: string;
    timestamp: Date;
    changes?: any;
}
export declare class DocumentProcessor {
    private readonly logger;
    handleDocumentCreated(job: Job<DocumentJobData>): Promise<void>;
    handleDocumentUpdated(job: Job<DocumentJobData>): Promise<void>;
    handleDocumentDeleted(job: Job<DocumentJobData>): Promise<void>;
}
export {};
