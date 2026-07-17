import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ITrajectoryRepository } from '../../../domain/ports/ITrajectoryRepository';
import { TrajectoryModel } from './models/trajectory.model';
import { Trajectory } from '../../../domain/entities/Trajectory';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class TrajectorySequelizeAdapter implements ITrajectoryRepository {
  constructor(
    @InjectModel(TrajectoryModel)
    private readonly trajectoryModel: typeof TrajectoryModel,
  ) {}

  private toDomain(model: TrajectoryModel | null): Trajectory | null {
    if (!model) return null;
    return new Trajectory(model.id, model.pnfId, model.name, model.orderNumber);
  }

  async findById(id: string): Promise<Trajectory | null> {
    const trajectory = await this.trajectoryModel.findByPk(id);
    return this.toDomain(trajectory);
  }

  async findAll(): Promise<Trajectory[]> {
    const trajectories = await this.trajectoryModel.findAll({
      order: [['orderNumber', 'ASC']],
    });
    return trajectories.map(
      (t) => new Trajectory(t.id, t.pnfId, t.name, t.orderNumber),
    );
  }

  async findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<Trajectory>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = {};
    if (dto.search) {
      where[Op.or] = [{ name: { [Op.like]: `%${dto.search}%` } }];
    }
    const { rows, count } = await this.trajectoryModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['orderNumber', 'ASC']],
    });
    return {
      data: rows.map(
        (r) => new Trajectory(r.id, r.pnfId, r.name, r.orderNumber),
      ),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  async save(trajectory: Trajectory): Promise<void> {
    await this.trajectoryModel.upsert({
      id: trajectory.id,
      pnfId: trajectory.pnfId,
      name: trajectory.name,
      orderNumber: trajectory.orderNumber,
    });
  }

  async delete(id: string): Promise<void> {
    await this.trajectoryModel.destroy({ where: { id } });
  }
}
