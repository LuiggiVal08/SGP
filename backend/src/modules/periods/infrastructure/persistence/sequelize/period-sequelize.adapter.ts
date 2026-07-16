import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { IPeriodRepository } from '../../../domain/ports/IPeriodRepository';
import { PeriodModel } from './models/period.model';
import { Period } from '../../../domain/entities/Period';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class PeriodSequelizeAdapter implements IPeriodRepository {
  constructor(
    @InjectModel(PeriodModel)
    private readonly periodModel: typeof PeriodModel,
  ) {}

  private toDomain(model: PeriodModel | null): Period | null {
    if (!model) return null;
    return new Period(
      model.id,
      model.name,
      model.startDate,
      model.endDate,
      model.isActive,
    );
  }

  async findById(id: string): Promise<Period | null> {
    const period = await this.periodModel.findByPk(id);
    return this.toDomain(period);
  }

  async findAll(): Promise<Period[]> {
    const periods = await this.periodModel.findAll({
      order: [['startDate', 'DESC']],
    });
    return periods.map(
      (p) => new Period(p.id, p.name, p.startDate, p.endDate, p.isActive),
    );
  }

  async findAllPaginated(dto: PaginationDto): Promise<PaginatedResult<Period>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = {};
    if (dto.search) {
      where[Op.or] = [{ name: { [Op.like]: `%${dto.search}%` } }];
    }
    const { rows, count } = await this.periodModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['startDate', 'DESC']],
    });
    return {
      data: rows.map(
        (r) => new Period(r.id, r.name, r.startDate, r.endDate, r.isActive),
      ),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  async save(period: Period): Promise<void> {
    await this.periodModel.upsert({
      id: period.id,
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      isActive: period.isActive,
    });
  }

  async delete(id: string): Promise<void> {
    await this.periodModel.destroy({ where: { id } });
  }
}
