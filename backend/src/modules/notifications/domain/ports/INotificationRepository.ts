import { Notification } from '../entities/Notification';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface INotificationRepository {
  create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    entityType?: string;
    entityId?: string;
  }): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(
    userId: string,
    dto: PaginationDto,
  ): Promise<PaginatedResult<Notification>>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
  countUnread(userId: string): Promise<number>;
}
