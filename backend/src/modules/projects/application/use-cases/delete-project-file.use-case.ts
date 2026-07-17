import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';

@Injectable()
export class DeleteProjectFileUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(projectId: string, fileId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const files = await this.projectRepository.findFilesByProjectId(projectId);
    const file = files.find((f) => f.id === fileId);
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    await this.projectRepository.deleteFile(fileId);
    return { message: 'Archivo eliminado exitosamente' };
  }
}
