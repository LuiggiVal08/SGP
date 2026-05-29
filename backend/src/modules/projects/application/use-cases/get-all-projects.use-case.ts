import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';

@Injectable()
export class GetAllProjectsUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(): Promise<any> {
    const cached = await this.cacheService.get('projects:all');
    if (cached) return JSON.parse(cached);

    const projects = await this.projectRepository.findAll();
    await this.cacheService.set('projects:all', JSON.stringify(projects), 3600);
    return projects;
  }
}
