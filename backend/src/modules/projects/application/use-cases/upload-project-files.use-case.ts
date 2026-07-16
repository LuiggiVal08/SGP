import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ProjectFile, DocumentType } from '../../domain/entities/ProjectFile';
import { randomUUID } from 'crypto';

interface UploadFileInput {
  projectId: string;
  documentType: DocumentType;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class UploadProjectFilesUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(input: UploadFileInput) {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    const currentVersion = await this.projectRepository.getMaxVersion(
      input.projectId,
      input.documentType,
    );

    const projectFile = new ProjectFile(
      randomUUID(),
      input.projectId,
      input.originalName,
      `uploads/projects/${input.projectId}/${input.fileName}`,
      input.documentType,
      '',
      currentVersion + 1,
      input.mimeType,
      input.size,
    );

    return this.projectRepository.saveFiles([projectFile]);
  }
}
