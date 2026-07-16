import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { CommunityTutorData } from '../../domain/entities/Project';

@Injectable()
export class UpdateProjectCommunityTutorUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(id: string, communityTutor: CommunityTutorData) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const result = await this.projectRepository.update(id, {
      communityTutor,
    });

    await this.cacheService.delete('projects:all');
    return result;
  }
}
