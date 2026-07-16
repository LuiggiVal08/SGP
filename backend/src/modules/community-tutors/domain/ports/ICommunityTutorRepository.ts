import { CommunityTutor } from '../entities/CommunityTutor';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface ICommunityTutorRepository {
  findById(id: string): Promise<CommunityTutor | null>;
  findAll(): Promise<CommunityTutor[]>;
  findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<CommunityTutor>>;
  save(communityTutor: CommunityTutor): Promise<void>;
  delete(id: string): Promise<void>;
}
