import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IDefenseJudgeRepository } from '../../../domain/ports/IDefenseJudgeRepository';
import { DefenseJudgeModel } from './models/defense-judge.model';
import { DefenseJudge, JudgeType } from '../../../domain/entities/DefenseJudge';

@Injectable()
export class DefenseJudgeSequelizeAdapter implements IDefenseJudgeRepository {
  constructor(
    @InjectModel(DefenseJudgeModel)
    private readonly defenseJudgeModel: typeof DefenseJudgeModel,
  ) {}

  private toDomain(model: DefenseJudgeModel | null): DefenseJudge | null {
    if (!model) return null;
    return new DefenseJudge(
      model.id,
      model.defenseId,
      model.judgeType as JudgeType,
      model.professorId ?? null,
      model.communityTutorId ?? null,
    );
  }

  async findById(id: string): Promise<DefenseJudge | null> {
    const j = await this.defenseJudgeModel.findByPk(id);
    return this.toDomain(j);
  }

  async findByDefense(defenseId: string): Promise<DefenseJudge[]> {
    const js = await this.defenseJudgeModel.findAll({ where: { defenseId } });
    return js.map(
      (j) =>
        new DefenseJudge(
          j.id,
          j.defenseId,
          j.judgeType as JudgeType,
          j.professorId ?? null,
          j.communityTutorId ?? null,
        ),
    );
  }

  async countByDefense(defenseId: string): Promise<number> {
    return this.defenseJudgeModel.count({ where: { defenseId } });
  }

  async save(defenseJudge: DefenseJudge): Promise<void> {
    await this.defenseJudgeModel.upsert({
      id: defenseJudge.id,
      defenseId: defenseJudge.defenseId,
      judgeType: defenseJudge.judgeType,
      professorId: defenseJudge.professorId,
      communityTutorId: defenseJudge.communityTutorId,
    });
  }

  async delete(id: string): Promise<void> {
    await this.defenseJudgeModel.destroy({ where: { id } });
  }
}
