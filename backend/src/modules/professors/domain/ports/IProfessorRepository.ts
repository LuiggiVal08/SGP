import { Professor } from '../entities/Professor';

export interface IProfessorRepository {
  findById(id: string): Promise<Professor | null>;
  findByUserId(userId: string): Promise<Professor | null>;
  save(professor: Professor): Promise<void>;
}
