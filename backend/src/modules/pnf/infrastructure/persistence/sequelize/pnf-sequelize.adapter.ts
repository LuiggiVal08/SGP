import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { IPnfRepository } from '../../../domain/ports/IPnfRepository';
import { PnfModel } from './models/pnf.model';
import { Pnf } from '../../../domain/entities/Pnf';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class PnfSequelizeAdapter implements IPnfRepository {
  constructor(
    @InjectModel(PnfModel)
    private readonly pnfModel: typeof PnfModel,
  ) {}

  private toDomain(model: PnfModel | null): Pnf | null {
    if (!model) return null;
    return new Pnf(
      model.id,
      model.name,
      model.institutionId,
      model.coordinatorId ?? undefined,
    );
  }

  async findById(id: string): Promise<Pnf | null> {
    const pnf = await this.pnfModel.findByPk(id);
    return this.toDomain(pnf);
  }

  async findAll(institutionId?: string): Promise<Pnf[]> {
    const where: Record<string, any> = {};
    if (institutionId) {
      where.institutionId = institutionId;
    }
    const pnfs = await this.pnfModel.findAll({
      where,
      order: [['name', 'ASC']],
    });
    return pnfs.map(
      (c) =>
        new Pnf(c.id, c.name, c.institutionId, c.coordinatorId ?? undefined),
    );
  }

  async findByInstitutionId(institutionId: string): Promise<Pnf[]> {
    const pnfs = await this.pnfModel.findAll({
      where: { institutionId },
      order: [['name', 'ASC']],
    });
    return pnfs.map(
      (c) =>
        new Pnf(c.id, c.name, c.institutionId, c.coordinatorId ?? undefined),
    );
  }

  async countByInstitutionId(institutionId: string): Promise<number> {
    return this.pnfModel.count({ where: { institutionId } });
  }

  async findAllPaginated(
    dto: PaginationDto,
    institutionId?: string,
  ): Promise<PaginatedResult<Pnf>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = {};
    if (dto.search) {
      where.name = { [Op.like]: `%${dto.search}%` };
    }
    if (institutionId) {
      where.institutionId = institutionId;
    }
    const { rows, count } = await this.pnfModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['name', 'ASC']],
    });
    return {
      data: rows.map(
        (r) =>
          new Pnf(r.id, r.name, r.institutionId, r.coordinatorId ?? undefined),
      ),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  async save(pnf: Pnf): Promise<void> {
    await this.pnfModel.upsert({
      id: pnf.id,
      name: pnf.name,
      institutionId: pnf.institutionId,
      coordinatorId: pnf.coordinatorId ?? null,
    });
  }

  async delete(id: string): Promise<void> {
    await this.pnfModel.destroy({ where: { id } });
  }
}
