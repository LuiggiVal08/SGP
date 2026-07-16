import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import {
  ProjectRevision,
  MilestoneStatus,
} from '../../domain/entities/Project';
import { randomUUID } from 'crypto';

@Injectable()
export class UpdateMilestoneStatusUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    milestoneId: string,
    status: MilestoneStatus,
    userId: string,
    comment?: string,
  ) {
    const milestone =
      await this.projectRepository.findMilestoneById(milestoneId);
    if (!milestone) {
      throw new NotFoundException('Hito no encontrado');
    }

    const statusBefore = milestone.status;

    const updated = await this.projectRepository.updateMilestoneStatus(
      milestoneId,
      status,
      userId,
    );

    if (comment) {
      await this.projectRepository.createRevision(
        new ProjectRevision(
          randomUUID(),
          milestoneId,
          userId,
          comment,
          statusBefore,
          status,
        ),
      );
    }

    return updated;
  }
}
