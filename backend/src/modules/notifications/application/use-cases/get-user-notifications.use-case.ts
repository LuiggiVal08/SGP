import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import type { PaginationDto } from '@share/application/dtos/pagination.dto';

@Injectable()
export class GetUserNotificationsUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  execute(userId: string, dto: PaginationDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return this.notificationRepository.findByUserId(userId, dto);
  }
}
