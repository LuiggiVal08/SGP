/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { CreateProjectUseCase } from '../../../application/use-cases/create-project.use-case';
import { UploadProjectFilesUseCase } from '../../../application/use-cases/upload-project-files.use-case';
import { GetAllProjectsUseCase } from '../../../application/use-cases/get-all-projects.use-case';
import { CreateProjectDto } from '../dtos/create-project.dto';
import type { FileType } from '../../../domain/entities/ProjectFile';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

const VALID_TYPES: FileType[] = ['THESIS_PDF', 'SOURCE_CODE', 'BUSINESS_PLAN'];

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly uploadProjectFilesUseCase: UploadProjectFilesUseCase,
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    return this.createProjectUseCase.execute({
      title: dto.title,
      year: dto.year,
      careerId: dto.careerId,
      authorIds: dto.authorIds,
      tutorId: dto.tutorId,
    });
  }

  @Post(':id/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const projectId = req.params.id as string;
          const dest = join(process.cwd(), 'uploads', 'projects', projectId);
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: MulterFile,
    @Body('fileType') fileType: FileType,
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (!VALID_TYPES.includes(fileType)) {
      throw new BadRequestException(`Invalid file type: ${fileType}`);
    }

    return this.uploadProjectFilesUseCase.execute({
      projectId: id,
      fileType,
      fileName: file.filename,
      originalName: file.originalname,
    });
  }

  @Get()
  async findAll(): Promise<any> {
    return this.getAllProjectsUseCase.execute();
  }
}
