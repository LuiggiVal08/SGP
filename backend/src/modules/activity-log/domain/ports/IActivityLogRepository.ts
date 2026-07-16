import { ActivityLog } from '../entities/ActivityLog';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface IActivityLogRepository {
  create(log: ActivityLog): Promise<void>;
  findAllPaginated(dto: PaginationDto): Promise<PaginatedResult<ActivityLog>>;
}
