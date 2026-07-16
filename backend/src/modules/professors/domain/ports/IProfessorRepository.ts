import { Professor } from '../entities/Professor';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';
import type { ProfessorProfileDto } from '../../infrastructure/http/dtos/professor-profile.dto';

export interface IProfessorRepository {
  findById(id: string): Promise<Professor | null>;
  findByUserId(userId: string): Promise<Professor | null>;
  findProfileById(id: string): Promise<ProfessorProfileDto | null>;
  findAllPaginated(dto: PaginationDto): Promise<PaginatedResult<Professor>>;
  save(professor: Professor): Promise<void>;
  delete(id: string): Promise<void>;
}
