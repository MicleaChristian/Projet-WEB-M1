import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { User } from '@prisma/client';
import { UpdateDocumentInput } from './dto/update-document.input';

@Resolver(() => Document)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  @Mutation(() => Document)
  @UseGuards(JwtAuthGuard)
  async createDocument(
    @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.create(createDocumentInput, user.id);
  }

  @Query(() => [Document], { name: 'documents' })
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: User) {
    // For security, always filter by user - no one should see all documents
    return this.documentsService.findByUser(user.id);
  }

  @Query(() => [Document], { name: 'documentsByUser' })
  @UseGuards(JwtAuthGuard)
  findByUser(@CurrentUser() user: User) {
    return this.documentsService.findByUser(user.id);
  }

  @Query(() => Document, { name: 'document' })
  @UseGuards(JwtAuthGuard)
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.findOne(id, user.id);
  }

  @Mutation(() => Document)
  @UseGuards(JwtAuthGuard)
  updateDocument(
    @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.update(updateDocumentInput.id, updateDocumentInput, user.id);
  }

  @Mutation(() => Document)
  @UseGuards(JwtAuthGuard)
  removeDocument(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.remove(id, user.id);
  }
} 