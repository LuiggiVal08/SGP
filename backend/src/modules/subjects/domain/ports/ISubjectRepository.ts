import { Subject } from '../entities/Subject';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface ISubjectRepository {
  findById(id: string): Promise<Subject | null>;
  findAll(): Promise<Subject[]>;
  findAllPaginated(dto: PaginationDto): Promise<PaginatedResult<Subject>>;
  save(subject: Subject): Promise<void>;
  delete(id: string): Promise<void>;
}
