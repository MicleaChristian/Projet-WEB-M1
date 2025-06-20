import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { DocumentsService } from './documents.service';
import { existsSync } from 'fs';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = join(process.cwd(), 'uploads');
          console.log('Upload destination:', uploadPath);
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${uniqueSuffix}${extname(file.originalname)}`;
          console.log('Generated filename:', filename);
          callback(null, filename);
        },
      }),
      // Temporarily disable file filter for debugging
      // fileFilter: (req, file, callback) => {
      //   callback(null, true);
      // },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('content') content: string,
    @CurrentUser() user: User,
  ) {
    try {
      console.log('Upload attempt:', { file, title, content, user: user?.id });
      
      if (!file) {
        throw new Error('No file uploaded');
      }

      const document = await this.documentsService.create({
        title: title || file.originalname,
        content: content || 'Uploaded file',
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
      }, user.id);

      return {
        message: 'File uploaded successfully',
        document,
        file: {
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
        },
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  @Get('test')
  async test() {
    return { message: 'Documents controller is working!' };
  }

  @Get('download/:id')
  @UseGuards(JwtAuthGuard)
  async downloadFile(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const document = await this.documentsService.findOne(id, user.id);
    
    if (!document || !document.filePath) {
      throw new NotFoundException('File not found');
    }

    const filePath = join(process.cwd(), document.filePath);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    
    return res.sendFile(filePath);
  }
} 