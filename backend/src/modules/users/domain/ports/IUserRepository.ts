import { User } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByDni(dni: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByRoleId(roleId: string): Promise<User[]>;
  save(user: User): Promise<void>;
}
