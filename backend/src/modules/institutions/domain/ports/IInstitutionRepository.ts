import { Institution } from '../entities/Institution';

export interface IInstitutionRepository {
  findById(id: string): Promise<Institution | null>;
  findByCoordinatorId(professorId: string): Promise<Institution | null>;
  findAll(): Promise<Institution[]>;
  save(institution: Institution): Promise<void>;
  delete(id: string): Promise<void>;
}
