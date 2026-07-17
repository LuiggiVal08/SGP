import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ICommunityPlaceRepository } from '../../../domain/ports/ICommunityPlaceRepository';
import { CommunityPlaceModel } from './models/community-place.model';
import { CommunityPlace } from '../../../domain/entities/CommunityPlace';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class CommunityPlaceSequelizeAdapter implements ICommunityPlaceRepository {
  constructor(
    @InjectModel(CommunityPlaceModel)
    private readonly communityPlaceModel: typeof CommunityPlaceModel,
  ) {}

  private toDomain(model: CommunityPlaceModel | null): CommunityPlace | null {
    if (!model) return null;
    return new CommunityPlace(
      model.id,
      model.institutionId,
      model.name,
      model.type,
      model.description,
      model.address,
      model.contactPhone,
      model.contactEmail,
    );
  }

  async findById(id: string): Promise<CommunityPlace | null> {
    const place = await this.communityPlaceModel.findByPk(id);
    return this.toDomain(place);
  }

  async findAll(): Promise<CommunityPlace[]> {
    const places = await this.communityPlaceModel.findAll({
      order: [['name', 'ASC']],
    });
    return places.map(
      (p) =>
        new CommunityPlace(
          p.id,
          p.institutionId,
          p.name,
          p.type,
          p.description,
          p.address,
          p.contactPhone,
          p.contactEmail,
        ),
    );
  }

  async findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<CommunityPlace>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = {};
    if (dto.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${dto.search}%` } },
        { description: { [Op.like]: `%${dto.search}%` } },
      ];
    }
    const { rows, count } = await this.communityPlaceModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['name', 'ASC']],
    });
    return {
      data: rows.map(
        (r) =>
          new CommunityPlace(
            r.id,
            r.institutionId,
            r.name,
            r.type,
            r.description,
            r.address,
            r.contactPhone,
            r.contactEmail,
          ),
      ),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  async save(communityPlace: CommunityPlace): Promise<void> {
    await this.communityPlaceModel.upsert({
      id: communityPlace.id,
      institutionId: communityPlace.institutionId,
      name: communityPlace.name,
      type: communityPlace.type,
      description: communityPlace.description,
      address: communityPlace.address,
      contactPhone: communityPlace.contactPhone,
      contactEmail: communityPlace.contactEmail,
    });
  }

  async delete(id: string): Promise<void> {
    await this.communityPlaceModel.destroy({ where: { id } });
  }
}
