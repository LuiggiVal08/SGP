import { ProjectSubjectAssignment } from '../entities/ProjectSubjectAssignment';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface IProjectSubjectAssignmentRepository {
  findById(id: string): Promise<ProjectSubjectAssignment | null>;
  findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<ProjectSubjectAssignment>>;
  findByUnique(
    subjectId: string,
    professorId: string,
    periodId: string,
  ): Promise<ProjectSubjectAssignment | null>;
  save(assignment: ProjectSubjectAssignment): Promise<void>;
  delete(id: string): Promise<void>;
}
