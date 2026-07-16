import { Injectable, Inject } from '@nestjs/common';
import { IProjectTagRepository } from '../../domain/ports/IProjectTagRepository';

@Injectable()
export class AssignTagUseCase {
  constructor(
    @Inject('IProjectTagRepository')
    private readonly adapter: IProjectTagRepository,
  ) {}

  async execute(projectId: string, tagId: string): Promise<void> {
    await this.adapter.assign(projectId, tagId);
  }
}
