import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ProjectMilestone } from '../../domain/entities/Project';

@Injectable()
export class CreateMilestonesUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(projectId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const existing =
      await this.projectRepository.findMilestonesByProject(projectId);
    if (existing.length > 0) {
      return existing;
    }

    const milestones: ProjectMilestone[] = [];
    for (let t = 1; t <= 3; t++) {
      const m = await this.projectRepository.createMilestone(
        projectId,
        'TRIMESTRE',
        t,
      );
      milestones.push(m);
    }
    const defensa = await this.projectRepository.createMilestone(
      projectId,
      'DEFENSA',
    );
    milestones.push(defensa);

    return milestones;
  }
}
