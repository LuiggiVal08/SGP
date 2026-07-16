import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    relatedId?: string | null;
  }) {
    const notification = new Notification(
      randomUUID(),
      data.userId,
      data.title,
      data.message,
      data.type,
      false,
      data.relatedId ?? null,
      new Date(),
    );
    await this.notificationRepository.save(notification);
    return notification;
  }
}
