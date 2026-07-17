import { Period } from '../entities/Period';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface IPeriodRepository {
  findById(id: string): Promise<Period | null>;
  findAll(): Promise<Period[]>;
  findAllPaginated(dto: PaginationDto): Promise<PaginatedResult<Period>>;
  save(period: Period): Promise<void>;
  delete(id: string): Promise<void>;
}
