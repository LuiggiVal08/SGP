import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ICommunityTutorRepository } from '../../../domain/ports/ICommunityTutorRepository';
import { CommunityTutorModel } from './models/community-tutor.model';
import { CommunityTutor } from '../../../domain/entities/CommunityTutor';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class CommunityTutorSequelizeAdapter implements ICommunityTutorRepository {
  constructor(
    @InjectModel(CommunityTutorModel)
    private readonly communityTutorModel: typeof CommunityTutorModel,
  ) {}

  private toDomain(model: CommunityTutorModel | null): CommunityTutor | null {
    if (!model) return null;
    return new CommunityTutor(
      model.id,
      model.locationId,
      model.fullName,
      model.dni,
      model.phone,
      model.email,
      model.position,
    );
  }

  async findById(id: string): Promise<CommunityTutor | null> {
    const tutor = await this.communityTutorModel.findByPk(id);
    return this.toDomain(tutor);
  }

  async findAll(): Promise<CommunityTutor[]> {
    const tutors = await this.communityTutorModel.findAll({
      order: [['fullName', 'ASC']],
    });
    return tutors.map(
      (t) =>
        new CommunityTutor(
          t.id,
          t.locationId,
          t.fullName,
          t.dni,
          t.phone,
          t.email,
          t.position,
        ),
    );
  }

  async findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<CommunityTutor>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = {};
    if (dto.search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${dto.search}%` } },
        { position: { [Op.like]: `%${dto.search}%` } },
      ];
    }
    const { rows, count } = await this.communityTutorModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['fullName', 'ASC']],
    });
    return {
      data: rows.map(
        (r) =>
          new CommunityTutor(
            r.id,
            r.locationId,
            r.fullName,
            r.dni,
            r.phone,
            r.email,
            r.position,
          ),
      ),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  async save(communityTutor: CommunityTutor): Promise<void> {
    await this.communityTutorModel.upsert({
      id: communityTutor.id,
      locationId: communityTutor.locationId,
      fullName: communityTutor.fullName,
      dni: communityTutor.dni,
      phone: communityTutor.phone,
      email: communityTutor.email,
      position: communityTutor.position,
    });
  }

  async delete(id: string): Promise<void> {
    await this.communityTutorModel.destroy({ where: { id } });
  }
}
