import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';

@Injectable()
export class DeleteNotificationUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }
    await this.notificationRepository.delete(id);
  }
}
