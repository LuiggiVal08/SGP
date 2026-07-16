import { Injectable, Inject } from '@nestjs/common';
import { IProjectSubjectAssignmentRepository } from '../../domain/ports/IProjectSubjectAssignmentRepository';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';
import { ProjectSubjectAssignment } from '../../domain/entities/ProjectSubjectAssignment';

@Injectable()
export class GetAllProjectSubjectAssignmentsUseCase {
  constructor(
    @Inject('IProjectSubjectAssignmentRepository')
    private readonly assignmentRepository: IProjectSubjectAssignmentRepository,
  ) {}

  async execute(
    dto: PaginationDto,
  ): Promise<PaginatedResult<ProjectSubjectAssignment>> {
    return this.assignmentRepository.findAllPaginated(dto);
  }
}
