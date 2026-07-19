import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificationModel } from './infrastructure/persistence/sequelize/models/notification.model';
import { NotificationSequelizeAdapter } from './infrastructure/persistence/sequelize/notification-sequelize.adapter';
import { NotificationService } from './application/services/notification.service';
import { NotificationController } from './infrastructure/http/controllers/notification.controller';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { GetUserNotificationsUseCase } from './application/use-cases/get-user-notifications.use-case';
import { MarkAsReadUseCase } from './application/use-cases/mark-as-read.use-case';
import { MarkAllAsReadUseCase } from './application/use-cases/mark-all-as-read.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';

@Module({
  imports: [SequelizeModule.forFeature([NotificationModel])],
  providers: [
    {
      provide: 'INotificationRepository',
      useClass: NotificationSequelizeAdapter,
    },
    NotificationService,
    CreateNotificationUseCase,
    GetUserNotificationsUseCase,
    MarkAsReadUseCase,
    MarkAllAsReadUseCase,
    DeleteNotificationUseCase,
  ],
  controllers: [NotificationController],
  exports: ['INotificationRepository', NotificationService],
})
export class NotificationsModule {}
