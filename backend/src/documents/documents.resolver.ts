import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Document)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  @Mutation(() => Document)
  @UseGuards(JwtAuthGuard)
  async createDocument(
    @Args('createDocumentInput') createDocumentInput: CreateDocumentInput,
    @CurrentUser() user: User
  ) {
    // Override userId with authenticated user's ID
    const documentData = { ...createDocumentInput, userId: user.id };
    return this.documentsService.create(documentData);
  }

  @Query(() => [Document], { name: 'documents' })
  @UseGuards(JwtAuthGuard)
  async findAll(@CurrentUser() user: User) {
    // Only return documents for the authenticated user
    return this.documentsService.findByUser(user.id);
  }

  @Query(() => [Document], { name: 'documentsByUser' })
  @UseGuards(JwtAuthGuard)
  async findByUser(@CurrentUser() user: User) {
    // Return documents for the authenticated user
    return this.documentsService.findByUser(user.id);
  }

  @Query(() => Document, { name: 'document' })
  @UseGuards(JwtAuthGuard)
  async findOne(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: User) {
    const document = await this.documentsService.findOne(id);
    if (!document) {
      throw new Error(`Document with ID ${id} not found`);
    }
    
    // Only allow users to see their own documents or admins to see any
    if (user.role !== 'admin' && document.userId !== user.id) {
      throw new Error('Unauthorized access to document');
    }
    
    return document;
  }

  @Mutation(() => Document)
  @UseGuards(JwtAuthGuard)
  async updateDocument(
    @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
    @CurrentUser() user: User
  ) {
    const document = await this.documentsService.findOne(updateDocumentInput.id);
    if (!document) {
      throw new Error(`Document with ID ${updateDocumentInput.id} not found`);
    }
    
    // Only allow users to update their own documents or admins to update any
    if (user.role !== 'admin' && document.userId !== user.id) {
      throw new Error('Unauthorized access to document');
    }
    
    return this.documentsService.update(updateDocumentInput.id, updateDocumentInput);
  }

  @Mutation(() => Document)
  @UseGuards(JwtAuthGuard)
  async removeDocument(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: User) {
    const document = await this.documentsService.findOne(id);
    if (!document) {
      throw new Error(`Document with ID ${id} not found`);
    }
    
    // Only allow users to delete their own documents or admins to delete any
    if (user.role !== 'admin' && document.userId !== user.id) {
      throw new Error('Unauthorized access to document');
    }
    
    return this.documentsService.remove(id);
  }
} 