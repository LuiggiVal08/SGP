import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';

@Injectable()
export class MarkAllAsReadUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
