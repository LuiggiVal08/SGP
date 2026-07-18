import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { ProjectScopeService, ScopeUser } from '../services/project-scope.service';

@Injectable()
export class GetAllProjectsUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
    private readonly projectScopeService: ProjectScopeService,
  ) {}

  async execute(user: ScopeUser): Promise<any> {
    const allowedIds = await this.projectScopeService.resolveAllowedProjectIds(
      user,
    );
    if (allowedIds === null) {
      const cached = await this.cacheService.get('projects:all');
      if (cached) return JSON.parse(cached);
      const projects = await this.projectRepository.findAll();
      await this.cacheService.set(
        'projects:all',
        JSON.stringify(projects),
        3600,
      );
      return projects;
    }
    return this.projectRepository.findByIds(allowedIds);
  }

  async executePaginated(params: {
    page: number;
    limit: number;
    search?: string;
    user: ScopeUser;
  }) {
    const allowedIds = await this.projectScopeService.resolveAllowedProjectIds(
      params.user,
    );
    return this.projectRepository.findAllPaginated({
      page: params.page,
      limit: params.limit,
      search: params.search,
      scopeIds: allowedIds,
    });
  }
}
