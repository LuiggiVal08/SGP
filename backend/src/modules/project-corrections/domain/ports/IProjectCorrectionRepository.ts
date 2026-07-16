import { ProjectCorrection } from '../entities/ProjectCorrection';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface IProjectCorrectionRepository {
  findById(id: string): Promise<ProjectCorrection | null>;
  findAllByProjectPaginated(
    projectId: string,
    dto: PaginationDto,
  ): Promise<PaginatedResult<ProjectCorrection>>;
  save(correction: ProjectCorrection): Promise<void>;
  delete(id: string): Promise<void>;
}
