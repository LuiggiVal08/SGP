import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ISubjectRepository } from '../../../domain/ports/ISubjectRepository';
import { SubjectModel } from './models/subject.model';
import { Subject } from '../../../domain/entities/Subject';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class SubjectSequelizeAdapter implements ISubjectRepository {
  constructor(
    @InjectModel(SubjectModel)
    private readonly subjectModel: typeof SubjectModel,
  ) {}

  private toDomain(model: SubjectModel | null): Subject | null {
    if (!model) return null;
    return new Subject(model.id, model.trajectoryId, model.name);
  }

  async findById(id: string): Promise<Subject | null> {
    const subject = await this.subjectModel.findByPk(id);
    return this.toDomain(subject);
  }

  async findAll(): Promise<Subject[]> {
    const subjects = await this.subjectModel.findAll({
      order: [['name', 'ASC']],
    });
    return subjects.map((s) => new Subject(s.id, s.trajectoryId, s.name));
  }

  async findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<Subject>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = {};
    if (dto.search) {
      where[Op.or] = [{ name: { [Op.like]: `%${dto.search}%` } }];
    }
    const { rows, count } = await this.subjectModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['name', 'ASC']],
    });
    return {
      data: rows.map((r) => new Subject(r.id, r.trajectoryId, r.name)),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  async save(subject: Subject): Promise<void> {
    await this.subjectModel.upsert({
      id: subject.id,
      trajectoryId: subject.trajectoryId,
      name: subject.name,
    });
  }

  async delete(id: string): Promise<void> {
    await this.subjectModel.destroy({ where: { id } });
  }
}
