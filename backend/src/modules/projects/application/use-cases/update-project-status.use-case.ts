import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { ProjectStatus } from '../../domain/entities/Project';

interface UpdateProjectStatusInput {
  id: string;
  status: ProjectStatus;
}

@Injectable()
export class UpdateProjectStatusUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(input: UpdateProjectStatusInput) {
    const project = await this.projectRepository.findById(input.id);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const result = await this.projectRepository.update(input.id, {
      status: input.status,
    });

    await this.cacheService.delete('projects:all');
    return result;
  }
}
