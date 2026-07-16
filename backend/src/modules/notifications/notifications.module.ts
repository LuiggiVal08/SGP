import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificationModel } from './infrastructure/persistence/sequelize/models/notification.model';
import { NotificationSequelizeAdapter } from './infrastructure/persistence/sequelize/notification-sequelize.adapter';
import { NotificationService } from './application/services/notification.service';
import { NotificationController } from './infrastructure/http/notification.controller';

@Module({
  imports: [SequelizeModule.forFeature([NotificationModel])],
  providers: [
    {
      provide: 'INotificationRepository',
      useClass: NotificationSequelizeAdapter,
    },
    NotificationService,
  ],
  controllers: [NotificationController],
  exports: ['INotificationRepository', NotificationService],
})
export class NotificationsModule {}
