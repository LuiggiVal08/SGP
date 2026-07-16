import { Tag } from '../entities/Tag';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface ITagRepository {
  findById(id: string): Promise<Tag | null>;
  findAll(): Promise<Tag[]>;
  findAllPaginated(dto: PaginationDto): Promise<PaginatedResult<Tag>>;
  save(tag: Tag): Promise<void>;
  delete(id: string): Promise<void>;
}
