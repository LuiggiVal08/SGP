import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { IActivityLogRepository } from '../../../domain/ports/IActivityLogRepository';
import { ActivityLogModel } from './models/activity-log.model';
import { ActivityLog } from '../../../domain/entities/ActivityLog';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';

@Injectable()
export class ActivityLogSequelizeAdapter implements IActivityLogRepository {
  constructor(
    @InjectModel(ActivityLogModel)
    private readonly activityLogModel: typeof ActivityLogModel,
  ) {}

  private toDomain(model: ActivityLogModel): ActivityLog {
    return new ActivityLog(
      model.id,
      model.userId,
      model.action,
      model.entityType,
      model.entityId,
      model.description,
      model.details ?? null,
      model.createdAt.toISOString(),
      model.user
        ? {
            id: model.user.id,
            firstName: model.user.firstName,
            lastName: model.user.lastName,
            email: model.user.email,
          }
        : undefined,
    );
  }

  async create(log: ActivityLog): Promise<void> {
    await this.activityLogModel.create({
      id: log.id,
      userId: log.userId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      description: log.description,
      details: log.details,
    });
  }

  async findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<ActivityLog>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = {};
    if (dto.search) {
      where.description = { [Op.like]: `%${dto.search}%` };
    }

    const { rows, count } = await this.activityLogModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: UserModel,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    return {
      data: rows.map((r) => this.toDomain(r)),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }
}
