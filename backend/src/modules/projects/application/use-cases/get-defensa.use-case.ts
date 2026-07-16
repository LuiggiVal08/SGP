import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';

@Injectable()
export class GetDefensaUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(projectId: string) {
    return this.projectRepository.findDefensaByProject(projectId);
  }
}
