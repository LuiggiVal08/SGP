import { DefenseScheduleChange } from '../entities/DefenseScheduleChange';

export interface IDefenseScheduleChangeRepository {
  findByDefense(defenseId: string): Promise<DefenseScheduleChange[]>;
  save(change: DefenseScheduleChange): Promise<void>;
}
