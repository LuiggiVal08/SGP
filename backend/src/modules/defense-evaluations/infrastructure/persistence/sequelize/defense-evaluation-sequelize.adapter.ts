import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { IDefenseEvaluationRepository } from '../../../domain/ports/IDefenseEvaluationRepository';
import { DefenseEvaluationModel } from './models/defense-evaluation.model';
import { DefenseJudgeModel } from '@modules/defense-judges/infrastructure/persistence/sequelize/models/defense-judge.model';
import { DefenseEvaluation } from '../../../domain/entities/DefenseEvaluation';

@Injectable()
export class DefenseEvaluationSequelizeAdapter implements IDefenseEvaluationRepository {
  constructor(
    @InjectModel(DefenseEvaluationModel)
    private readonly defenseEvaluationModel: typeof DefenseEvaluationModel,
  ) {}

  private toDomain(model: DefenseEvaluationModel | null): DefenseEvaluation | null {
    if (!model) return null;
    return new DefenseEvaluation(
      model.id,
      model.judgeId,
      Number(model.score),
      model.comments ?? '',
    );
  }

  async findById(id: string): Promise<DefenseEvaluation | null> {
    const e = await this.defenseEvaluationModel.findByPk(id);
    return this.toDomain(e);
  }

  async findByJudge(judgeId: string): Promise<DefenseEvaluation | null> {
    const e = await this.defenseEvaluationModel.findOne({ where: { judgeId } });
    return this.toDomain(e);
  }

  async findByDefenseId(defenseId: string): Promise<DefenseEvaluation[]> {
    const judgeIds = await DefenseJudgeModel.findAll({
      where: { defenseId },
      attributes: ['id'],
    }).then((judges) => judges.map((j) => j.id));

    if (judgeIds.length === 0) return [];

    const evaluations = await this.defenseEvaluationModel.findAll({
      where: { judgeId: { [Op.in]: judgeIds } },
    });

    return evaluations.map(
      (e) =>
        new DefenseEvaluation(
          e.id,
          e.judgeId,
          Number(e.score),
          e.comments ?? '',
        ),
    );
  }

  async findAll(): Promise<DefenseEvaluation[]> {
    const es = await this.defenseEvaluationModel.findAll();
    return es.map(
      (e) =>
        new DefenseEvaluation(
          e.id,
          e.judgeId,
          Number(e.score),
          e.comments ?? '',
        ),
    );
  }

  async save(evaluation: DefenseEvaluation): Promise<void> {
    await this.defenseEvaluationModel.upsert({
      id: evaluation.id,
      judgeId: evaluation.judgeId,
      score: evaluation.score,
      comments: evaluation.comments,
    });
  }
}
