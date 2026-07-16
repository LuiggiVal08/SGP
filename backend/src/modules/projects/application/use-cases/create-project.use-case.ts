import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { Project } from '../../domain/entities/Project';
import { randomUUID } from 'crypto';

interface CreateProjectInput {
  title: string;
  description?: string;
  problemStatement?: string;
  subjectAssignmentId: string;
  locationId: string;
  communityTutorId: string;
  authorIds: string[];
  cdSubmitted?: boolean;
}

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(input: CreateProjectInput) {
    if (input.authorIds.length > 3) {
      throw new BadRequestException('Maximum 3 authors per project');
    }

    const project = new Project(
      randomUUID(),
      input.title,
      input.description ?? null,
      input.problemStatement ?? null,
      input.subjectAssignmentId,
      input.locationId,
      input.communityTutorId,
      'BORRADOR',
      input.cdSubmitted ?? false,
    );

    const result = await this.projectRepository.save(project, input.authorIds);
    await this.cacheService.delete('projects:all');
    return result;
  }
}
