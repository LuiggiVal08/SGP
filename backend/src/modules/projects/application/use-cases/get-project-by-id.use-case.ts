import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';

@Injectable()
export class GetProjectByIdUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(id: string): Promise<any> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }
    return project;
  }
}
