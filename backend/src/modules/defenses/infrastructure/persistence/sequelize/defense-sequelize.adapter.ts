import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IDefenseRepository } from '../../../domain/ports/IDefenseRepository';
import { DefenseModel } from './models/defense.model';
import { Defense, DefenseStatus } from '../../../domain/entities/Defense';

@Injectable()
export class DefenseSequelizeAdapter implements IDefenseRepository {
  constructor(
    @InjectModel(DefenseModel)
    private readonly defenseModel: typeof DefenseModel,
  ) {}

  private toDomain(model: DefenseModel | null): Defense | null {
    if (!model) return null;
    return new Defense(
      model.id,
      model.projectId,
      model.scheduledDate ?? new Date(),
      model.actualDate,
      model.status as DefenseStatus,
    );
  }

  async findById(id: string): Promise<Defense | null> {
    const def = await this.defenseModel.findByPk(id);
    return this.toDomain(def);
  }

  async findByProject(projectId: string): Promise<Defense | null> {
    const def = await this.defenseModel.findOne({ where: { projectId } });
    return this.toDomain(def);
  }

  async findAll(): Promise<Defense[]> {
    const defs = await this.defenseModel.findAll();
    return defs.map(
      (d) =>
        new Defense(
          d.id,
          d.projectId,
          d.scheduledDate ?? new Date(),
          d.actualDate,
          d.status as DefenseStatus,
        ),
    );
  }

  async save(defense: Defense): Promise<void> {
    await this.defenseModel.upsert({
      id: defense.id,
      projectId: defense.projectId,
      scheduledDate: defense.scheduledDate,
      actualDate: defense.actualDate,
      status: defense.status,
    });
  }

  async delete(id: string): Promise<void> {
    await this.defenseModel.destroy({ where: { id } });
  }
}
