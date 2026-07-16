import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import {
  ProjectRevision,
  MilestoneStatus,
} from '../../domain/entities/Project';
import { randomUUID } from 'crypto';

interface CreateRevisionInput {
  milestoneId: string;
  revisedBy: string;
  comment: string;
  statusAfter: MilestoneStatus;
}

@Injectable()
export class CreateRevisionUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(input: CreateRevisionInput) {
    const milestone = await this.projectRepository.findMilestoneById(
      input.milestoneId,
    );
    if (!milestone) {
      throw new NotFoundException('Hito no encontrado');
    }

    const revision = new ProjectRevision(
      randomUUID(),
      input.milestoneId,
      input.revisedBy,
      input.comment,
      milestone.status,
      input.statusAfter,
    );

    const created = await this.projectRepository.createRevision(revision);

    if (input.statusAfter !== milestone.status) {
      await this.projectRepository.updateMilestoneStatus(
        input.milestoneId,
        input.statusAfter,
        input.revisedBy,
      );
    }

    return created;
  }
}
