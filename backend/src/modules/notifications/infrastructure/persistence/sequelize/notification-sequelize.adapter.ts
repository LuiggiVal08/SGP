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
    private readonly notificationModel: typeof NotificationModel,
  ) {}

  private toDomain(model: NotificationModel | null): Notification | null {
    if (!model) return null;
    return new Notification(
      model.id,
      model.userId,
      model.title,
      model.message,
      model.type,
      model.read,
      model.relatedId,
      model.createdAt,
    );
  }

  async save(notification: Notification): Promise<void> {
    await this.notificationModel.upsert({
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      relatedId: notification.relatedId,
      createdAt: notification.createdAt,
    });
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await this.notificationModel.findByPk(id);
    return this.toDomain(notification);
  }

  async findByUser(
    userId: string,
    dto: PaginationDto,
  ): Promise<PaginatedResult<Notification>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = { userId };
    if (dto.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${dto.search}%` } },
        { message: { [Op.like]: `%${dto.search}%` } },
      ];
    }
    if (dto.status) {
      where.read = dto.status === 'READ';
    }

    const { rows, count } = await this.notificationModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    return {
      data: rows.map(
        (r) =>
          new Notification(
            r.id,
            r.userId,
            r.title,
            r.message,
            r.type,
            r.read,
            r.relatedId,
            r.createdAt,
          ),
      ),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationModel.update({ read: true }, { where: { id } });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.update({ read: true }, { where: { userId } });
  }

  async delete(id: string): Promise<void> {
    await this.notificationModel.destroy({ where: { id } });
  }
}
