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

    const resumenMilestone = await this.projectRepository.createMilestone(
      projectId,
      'ENTREGA_TOMO',
      1,
    );
    milestones.push(resumenMilestone);

    const tomoMilestone = await this.projectRepository.createMilestone(
      projectId,
      'ENTREGA_TOMO',
      2,
    );
    milestones.push(tomoMilestone);

    const revisionMilestone = await this.projectRepository.createMilestone(
      projectId,
      'REVISION',
      3,
    );
    milestones.push(revisionMilestone);

    const otraMilestone = await this.projectRepository.createMilestone(
      projectId,
      'OTRA',
      4,
    );
    milestones.push(otraMilestone);

    return milestones;
  }
}
