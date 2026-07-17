import { User } from '../entities/User';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByDni(dni: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findAllPaginated(
    dto: PaginationDto,
    role?: string,
  ): Promise<PaginatedResult<User>>;
  findByRoleId(roleId: string): Promise<User[]>;
  save(user: User): Promise<void>;
  update(id: string, data: Partial<Omit<User, 'id'>>): Promise<void>;
  countByInstitutionId(institutionId: string): Promise<number>;
  countByPnfId(pnfId: string): Promise<number>;
  countByRoleName(roleName: string): Promise<number>;
  delete(id: string): Promise<void>;
}
