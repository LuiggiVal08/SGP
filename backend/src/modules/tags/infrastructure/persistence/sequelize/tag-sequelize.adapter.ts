import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ITagRepository } from '../../../domain/ports/ITagRepository';
import { TagModel } from './models/tag.model';
import { Tag } from '../../../domain/entities/Tag';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class TagSequelizeAdapter implements ITagRepository {
  constructor(
    @InjectModel(TagModel)
    private readonly tagModel: typeof TagModel,
  ) {}

  private toDomain(model: TagModel | null): Tag | null {
    if (!model) return null;
    return new Tag(model.id, model.name, model.category);
  }

  async findById(id: string): Promise<Tag | null> {
    const tag = await this.tagModel.findByPk(id);
    return this.toDomain(tag);
  }

  async findAll(): Promise<Tag[]> {
    const tags = await this.tagModel.findAll({ order: [['name', 'ASC']] });
    return tags.map((t) => new Tag(t.id, t.name, t.category));
  }

  async findAllPaginated(dto: PaginationDto): Promise<PaginatedResult<Tag>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = {};
    if (dto.search) {
      where[Op.or] = [{ name: { [Op.like]: `%${dto.search}%` } }];
    }
    const { rows, count } = await this.tagModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['name', 'ASC']],
    });
    return {
      data: rows.map((r) => new Tag(r.id, r.name, r.category)),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  async save(tag: Tag): Promise<void> {
    await this.tagModel.upsert({
      id: tag.id,
      name: tag.name,
      category: tag.category,
    });
  }

  async delete(id: string): Promise<void> {
    await this.tagModel.destroy({ where: { id } });
  }
}
