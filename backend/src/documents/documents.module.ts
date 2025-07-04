import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { DocumentsResolver } from './documents.resolver';
import { DocumentsController } from './documents.controller';
import { DocumentProcessor } from './document.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'document-processing',
    }),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsResolver, DocumentsService, DocumentProcessor],
  exports: [DocumentsService],
})
export class DocumentsModule {} 