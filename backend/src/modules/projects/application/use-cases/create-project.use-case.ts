import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { IProjectSubjectAssignmentRepository } from '@modules/project-subject-assignments/domain/ports/IProjectSubjectAssignmentRepository';
import { ICommunityTutorRepository } from '@modules/community-tutors/domain/ports/ICommunityTutorRepository';
import { Project } from '../../domain/entities/Project';
import { randomUUID } from 'crypto';

interface CreateProjectInput {
  title: string;
  description?: string;
  problemStatement?: string;
  subjectAssignmentId: string;
  locationId: string;
  communityTutorId: string;
  studentIds: string[];
  cdSubmitted?: boolean;
}

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
    @Inject('IProjectSubjectAssignmentRepository')
    private readonly assignmentRepository: IProjectSubjectAssignmentRepository,
    @Inject('ICommunityTutorRepository')
    private readonly communityTutorRepository: ICommunityTutorRepository,
  ) {}

  async execute(input: CreateProjectInput) {
    if (input.studentIds.length > 3) {
      throw new BadRequestException('Maximum 3 authors per project');
    }

    const assignment = await this.assignmentRepository.findById(
      input.subjectAssignmentId,
    );
    if (!assignment) {
      throw new BadRequestException('Subject assignment not found');
    }

    const communityTutor = await this.communityTutorRepository.findById(
      input.communityTutorId,
    );
    if (!communityTutor) {
      throw new BadRequestException('Community tutor not found');
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

    const result = await this.projectRepository.save(project, input.studentIds);
    await this.cacheService.delete('projects:all');
    return result;
  }
}
