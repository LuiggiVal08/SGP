import { Defense } from '../entities/Defense';

export interface IDefenseRepository {
  findById(id: string): Promise<Defense | null>;
  findByProject(projectId: string): Promise<Defense | null>;
  findAll(): Promise<Defense[]>;
  save(defense: Defense): Promise<void>;
  delete(id: string): Promise<void>;
}
