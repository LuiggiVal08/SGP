import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ProjectFile, FileType } from '../../domain/entities/ProjectFile';
import { randomUUID } from 'crypto';

interface UploadFileInput {
  projectId: string;
  fileType: FileType;
  fileName: string;
  originalName: string;
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

    const projectFile = new ProjectFile(
      randomUUID(),
      input.projectId,
      input.originalName,
      `uploads/projects/${input.projectId}/${input.fileName}`,
      input.fileType,
    );

    return this.projectRepository.saveFiles([projectFile]);
  }
}
