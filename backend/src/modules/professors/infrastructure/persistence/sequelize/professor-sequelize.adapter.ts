import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ProfessorModel } from './models/professor.model';
import { IProfessorRepository } from '../../../domain/ports/IProfessorRepository';
import { Professor } from '../../../domain/entities/Professor';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

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

  async findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<Professor>> {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 10;
    const where: Record<string, unknown> = {};
    if (dto.search) {
      where.specialization = { [Op.like]: `%${dto.search}%` };
    }
    const { rows, count } = await this.professorModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    return {
      data: rows.map((r) => this.toDomain(r) as Professor),
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async save(professor: Professor): Promise<void> {
    await this.professorModel.upsert({
      id: professor.id,
      userId: professor.userId,
      specialization: professor.specialization ?? null,
    });
  }

  async delete(id: string): Promise<void> {
    await this.professorModel.destroy({ where: { id } });
  }
}
