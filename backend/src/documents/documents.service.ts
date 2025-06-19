import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  create(createDocumentInput: CreateDocumentInput) {
    const document = this.documentsRepository.create(createDocumentInput);
    return this.documentsRepository.save(document);
  }

  findAll() {
    return this.documentsRepository.find();
  }

  findOne(id: string) {
    return this.documentsRepository.findOneBy({ id });
  }

  async update(id: string, updateDocumentInput: UpdateDocumentInput) {
    await this.documentsRepository.update(id, updateDocumentInput);
    return this.findOne(id);
  }

  async remove(id: string) {
    const document = await this.findOne(id);
    await this.documentsRepository.delete(id);
    return document;
  }
} 