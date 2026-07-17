import { Pnf } from '../entities/Pnf';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface IPnfRepository {
  findById(id: string): Promise<Pnf | null>;
  findAll(institutionId?: string): Promise<Pnf[]>;
  findAllPaginated(
    dto: PaginationDto,
    institutionId?: string,
  ): Promise<PaginatedResult<Pnf>>;
  findByInstitutionId(institutionId: string): Promise<Pnf[]>;
  countByInstitutionId(institutionId: string): Promise<number>;
  save(pnf: Pnf): Promise<void>;
  delete(id: string): Promise<void>;
}
