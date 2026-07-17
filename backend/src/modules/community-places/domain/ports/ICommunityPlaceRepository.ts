import { CommunityPlace } from '../entities/CommunityPlace';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface ICommunityPlaceRepository {
  findById(id: string): Promise<CommunityPlace | null>;
  findAll(): Promise<CommunityPlace[]>;
  findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<CommunityPlace>>;
  save(communityPlace: CommunityPlace): Promise<void>;
  delete(id: string): Promise<void>;
}
