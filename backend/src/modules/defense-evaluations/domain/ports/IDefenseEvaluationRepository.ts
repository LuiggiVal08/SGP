import { DefenseEvaluation } from '../entities/DefenseEvaluation';

export interface IDefenseEvaluationRepository {
  findById(id: string): Promise<DefenseEvaluation | null>;
  findByJudge(judgeId: string): Promise<DefenseEvaluation | null>;
  findAll(): Promise<DefenseEvaluation[]>;
  save(evaluation: DefenseEvaluation): Promise<void>;
}
