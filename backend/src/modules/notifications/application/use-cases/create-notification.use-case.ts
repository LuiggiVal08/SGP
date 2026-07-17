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
    entityType?: string;
    entityId?: string;
  }) {
    return this.notificationRepository.create({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      entityType: data.entityType,
      entityId: data.entityId,
    });
  }
}
