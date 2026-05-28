import { Career } from '../entities/Career';

export interface ICareerRepository {
  findById(id: string): Promise<Career | null>;
  findAll(): Promise<Career[]>;
  save(career: Career): Promise<void>;
}
