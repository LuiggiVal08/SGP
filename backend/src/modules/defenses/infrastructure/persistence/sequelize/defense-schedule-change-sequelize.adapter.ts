import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IDefenseScheduleChangeRepository } from '../../../domain/ports/IDefenseScheduleChangeRepository';
import { DefenseScheduleChangeModel } from './models/defense-schedule-change.model';
import { DefenseScheduleChange } from '../../../domain/entities/DefenseScheduleChange';

@Injectable()
export class DefenseScheduleChangeSequelizeAdapter implements IDefenseScheduleChangeRepository {
  constructor(
    @InjectModel(DefenseScheduleChangeModel)
    private readonly model: typeof DefenseScheduleChangeModel,
  ) {}

  async findByDefense(defenseId: string): Promise<DefenseScheduleChange[]> {
    const rows = await this.model.findAll({
      where: { defenseId },
      order: [['createdAt', 'DESC']],
    });
    return rows.map(
      (r) =>
        new DefenseScheduleChange(
          r.id,
          r.defenseId,
          r.previousDate,
          r.newDate,
          r.changedBy,
          r.reason ?? '',
        ),
    );
  }

  async save(change: DefenseScheduleChange): Promise<void> {
    await this.model.create({
      id: change.id,
      defenseId: change.defenseId,
      previousDate: change.previousDate,
      newDate: change.newDate,
      changedBy: change.changedBy,
      reason: change.reason,
      createdAt: new Date(),
    });
  }
}
