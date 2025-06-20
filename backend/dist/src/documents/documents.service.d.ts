import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
export declare class DocumentsService {
    private documentsRepository;
    private documentQueue;
    constructor(documentsRepository: Repository<Document>, documentQueue: Queue);
    create(createDocumentInput: CreateDocumentInput, userId?: string): Promise<Document>;
    findAll(): Promise<Document[]>;
    findByUser(userId: string): Promise<Document[]>;
    findOne(id: string, userId?: string): Promise<Document>;
    update(id: string, updateDocumentInput: UpdateDocumentInput): Promise<Document>;
    remove(id: string): Promise<Document>;
}
