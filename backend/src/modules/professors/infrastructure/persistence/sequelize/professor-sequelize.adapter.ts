import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { ProfessorModel } from './models/professor.model';
import { IProfessorRepository } from '../../../domain/ports/IProfessorRepository';
import { Professor } from '../../../domain/entities/Professor';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';
import type { ProfessorProfileDto } from '../../http/dtos/professor-profile.dto';

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

  async findProfileById(id: string): Promise<ProfessorProfileDto | null> {
    const professor = await this.professorModel.findByPk(id);
    if (!professor) return null;

    const sequelize = this.professorModel.sequelize!;
    const rows = await sequelize.query<{
      id: string;
      userId: string;
      firstName: string;
      lastName: string;
      email: string;
      dni: string;
      phone: string | null;
      specialization: string | null;
      subjectId: string | null;
      subjectName: string | null;
      trajectoryName: string | null;
    }>(
      `SELECT p.id, p.userId, u.firstName, u.lastName, u.email, u.dni, u.phone,
              p.specialization,
              s.id AS subjectId, s.name AS subjectName, t.name AS trajectoryName
       FROM professors p
       INNER JOIN users u ON u.id = p.userId
       LEFT JOIN project_subject_assignments psa ON psa.professorId = p.id
       LEFT JOIN subjects s ON s.id = psa.subjectId
       LEFT JOIN trajectories t ON t.id = s.trajectoryId
       WHERE p.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );

    if (rows.length === 0) return null;

    const first = rows[0];
    const subjects = rows
      .filter((r) => r.subjectId !== null)
      .map((r) => ({
        id: r.subjectId!,
        name: r.subjectName!,
        trajectoryName: r.trajectoryName!,
      }));

    return {
      id: first.id,
      userId: first.userId,
      firstName: first.firstName,
      lastName: first.lastName,
      email: first.email,
      dni: first.dni,
      phone: first.phone,
      specialization: first.specialization,
      subjects,
    };
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
