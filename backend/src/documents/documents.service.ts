import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { Document } from '@prisma/client';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('document-processing')
    private documentQueue: Queue,
  ) {}

  async create(createDocumentInput: CreateDocumentInput, userId?: string) {
    const documentData = {
      ...createDocumentInput,
      userId: userId || createDocumentInput.userId,
    };
    
    const savedDocument = await this.prisma.document.create({
      data: documentData,
    });
    
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
    return this.prisma.document.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByUser(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string, userId?: string) {
    const whereCondition: { id: string; userId?: string } = { id };
    if (userId) {
      whereCondition.userId = userId;
    }
    return this.prisma.document.findUnique({ where: whereCondition });
  }

  async update(id: string, updateDocumentInput: UpdateDocumentInput) {
    const existingDocument = await this.findOne(id);
    if (!existingDocument) {
      throw new Error('Document not found');
    }

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: updateDocumentInput,
    });
    
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
    
    const deletedDocument = await this.prisma.document.delete({
      where: { id },
    });
    
    // Add job to queue for document deletion processing
    await this.documentQueue.add('document-deleted', {
      documentId: id,
      action: 'DELETE',
      userId: document.userId,
      timestamp: new Date(),
    });
    
    return deletedDocument;
  }
} 