import { Trajectory } from '../entities/Trajectory';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface ITrajectoryRepository {
  findById(id: string): Promise<Trajectory | null>;
  findAll(): Promise<Trajectory[]>;
  findAllPaginated(dto: PaginationDto): Promise<PaginatedResult<Trajectory>>;
  save(trajectory: Trajectory): Promise<void>;
  delete(id: string): Promise<void>;
}
