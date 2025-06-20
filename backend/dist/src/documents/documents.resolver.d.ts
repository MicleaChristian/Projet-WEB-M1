import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { User } from '../users/entities/user.entity';
export declare class DocumentsResolver {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    createDocument(createDocumentInput: CreateDocumentInput, user: User): Promise<Document>;
    findAll(user: User): Promise<Document[]>;
    findByUser(user: User): Promise<Document[]>;
    findOne(id: string, user: User): Promise<Document>;
    updateDocument(updateDocumentInput: UpdateDocumentInput, user: User): Promise<Document>;
    removeDocument(id: string, user: User): Promise<Document>;
}
