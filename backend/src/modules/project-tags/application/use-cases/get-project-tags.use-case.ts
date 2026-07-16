import { Injectable, Inject } from '@nestjs/common';
import { IProjectTagRepository } from '../../domain/ports/IProjectTagRepository';

@Injectable()
export class GetProjectTagsUseCase {
  constructor(
    @Inject('IProjectTagRepository')
    private readonly adapter: IProjectTagRepository,
  ) {}

  async execute(projectId: string) {
    return this.adapter.findByProject(projectId);
  }
}
