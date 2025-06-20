import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    @InjectQueue('document-processing')
    private documentQueue: Queue,
  ) {}

  async create(createDocumentInput: CreateDocumentInput, userId?: string) {
    const documentData = {
      ...createDocumentInput,
      userId: userId || createDocumentInput.userId,
    };
    
    const document = this.documentsRepository.create(documentData);
    const savedDocument = await this.documentsRepository.save(document);
    
    // Add job to queue for document processing (audit, analytics, etc.)
    await this.documentQueue.add('document-created', {
      documentId: savedDocument.id,
      action: 'CREATE',
      userId: savedDocument.userId,
      timestamp: new Date(),
    });
    
    return savedDocument;
  }

  findAll() {
    return this.documentsRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findByUser(userId: string) {
    return this.documentsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  findOne(id: string, userId?: string) {
    const whereCondition: any = { id };
    if (userId) {
      whereCondition.userId = userId;
    }
    return this.documentsRepository.findOne({ where: whereCondition });
  }

  async update(id: string, updateDocumentInput: UpdateDocumentInput) {
    const existingDocument = await this.findOne(id);
    if (!existingDocument) {
      throw new Error('Document not found');
    }

    await this.documentsRepository.update(id, updateDocumentInput);
    const updatedDocument = await this.findOne(id);
    
    // Add job to queue for document update processing
    await this.documentQueue.add('document-updated', {
      documentId: id,
      action: 'UPDATE',
      userId: existingDocument.userId,
      changes: updateDocumentInput,
      timestamp: new Date(),
    });
    
    return updatedDocument;
  }

  async remove(id: string) {
    const document = await this.findOne(id);
    if (!document) {
      throw new Error('Document not found');
    }
    
    await this.documentsRepository.delete(id);
    
    // Add job to queue for document deletion processing
    await this.documentQueue.add('document-deleted', {
      documentId: id,
      action: 'DELETE',
      userId: document.userId,
      timestamp: new Date(),
    });
    
    return document;
  }
} 