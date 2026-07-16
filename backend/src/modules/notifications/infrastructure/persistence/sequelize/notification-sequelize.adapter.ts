import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { INotificationRepository } from '../../../domain/ports/INotificationRepository';
import { NotificationModel } from './models/notification.model';
import { Notification } from '../../../domain/entities/Notification';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class NotificationSequelizeAdapter implements INotificationRepository {
  constructor(
    @InjectModel(NotificationModel)
    private readonly model: typeof NotificationModel,
  ) {}

  private toDomain(model: NotificationModel): Notification {
    return new Notification(
      model.id,
      model.userId,
      model.title,
      model.message,
      model.type,
      model.entityType,
      model.entityId,
      model.readAt,
      model.createdAt,
    );
  }

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    entityType?: string;
    entityId?: string;
  }): Promise<Notification> {
    const created = await this.model.create({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      entityType: data.entityType ?? null,
      entityId: data.entityId ?? null,
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Notification | null> {
    const found = await this.model.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByUserId(
    userId: string,
    dto: PaginationDto,
  ): Promise<PaginatedResult<Notification>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = { userId };
    if (dto.search) {
      where.title = { [Op.like]: `%${dto.search}%` };
    }

    const { rows, count } = await this.model.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows.map((r) => this.toDomain(r)),
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async markAsRead(id: string): Promise<void> {
    await this.model.update({ readAt: new Date() }, { where: { id } });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.model.update(
      { readAt: new Date() },
      { where: { userId, readAt: null } },
    );
  }

  async delete(id: string): Promise<void> {
    await this.model.destroy({ where: { id } });
  }

  async countUnread(userId: string): Promise<number> {
    return this.model.count({
      where: { userId, readAt: null },
    });
  }
}
