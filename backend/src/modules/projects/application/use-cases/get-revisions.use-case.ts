import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';

@Injectable()
export class GetRevisionsUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(milestoneId: string) {
    return this.projectRepository.findRevisionsByMilestone(milestoneId);
  }
}
