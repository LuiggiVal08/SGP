import { DefenseJudge } from '../entities/DefenseJudge';

export interface IDefenseJudgeRepository {
  findById(id: string): Promise<DefenseJudge | null>;
  findByDefense(defenseId: string): Promise<DefenseJudge[]>;
  countByDefense(defenseId: string): Promise<number>;
  save(defenseJudge: DefenseJudge): Promise<void>;
  delete(id: string): Promise<void>;
}
