import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProfessorModel } from './models/professor.model';
import { IProfessorRepository } from '../../../domain/ports/IProfessorRepository';
import { Professor } from '../../../domain/entities/Professor';

@Injectable()
export class ProfessorSequelizeAdapter implements IProfessorRepository {
  constructor(
    @InjectModel(ProfessorModel)
    private readonly professorModel: typeof ProfessorModel,
  ) {}

  private toDomain(model: ProfessorModel | null): Professor | null {
    if (!model) return null;
    return new Professor(
      model.id,
      model.userId,
      model.specialization ?? undefined,
    );
  }

  async findById(id: string): Promise<Professor | null> {
    const professor = await this.professorModel.findByPk(id);
    return this.toDomain(professor);
  }

  async findByUserId(userId: string): Promise<Professor | null> {
    const professor = await this.professorModel.findOne({ where: { userId } });
    return this.toDomain(professor);
  }

  async save(professor: Professor): Promise<void> {
    await this.professorModel.upsert({
      id: professor.id,
      userId: professor.userId,
      specialization: professor.specialization ?? null,
    });
  }
}
