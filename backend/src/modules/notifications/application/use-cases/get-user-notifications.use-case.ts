import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import type { PaginationDto } from '@share/application/dtos/pagination.dto';

@Injectable()
export class GetUserNotificationsUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string, dto: PaginationDto) {
    return this.notificationRepository.findByUser(userId, dto);
  }
}
