import { Professor } from '../entities/Professor';

export interface IProfessorRepository {
  findByUserId(userId: string): Promise<Professor | null>;
  save(professor: Professor): Promise<void>;
}
