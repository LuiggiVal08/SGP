// src/modules/users/domain/ports/IUserRepository.ts
import { User } from '../entities/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByDni(dni: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
