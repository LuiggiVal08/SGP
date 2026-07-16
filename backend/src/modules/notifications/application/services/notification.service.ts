import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('INotificationRepository')
    private readonly repository: INotificationRepository,
  ) {}

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    entityType?: string;
    entityId?: string;
  }): Promise<Notification> {
    this.logger.log(
      `Notification [${data.type}] for user ${data.userId}: ${data.title}`,
    );
    return this.repository.create(data);
  }

  async findByUser(
    userId: string,
    dto: PaginationDto,
  ): Promise<{
    notifications: PaginatedResult<Notification>;
    unreadCount: number;
  }> {
    const [notifications, unreadCount] = await Promise.all([
      this.repository.findByUserId(userId, dto),
      this.repository.countUnread(userId),
    ]);
    return { notifications, unreadCount };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const notification = await this.repository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.repository.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.markAllAsRead(userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.repository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.repository.delete(id);
  }
}
