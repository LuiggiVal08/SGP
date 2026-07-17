import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActivityLogModel } from './infrastructure/persistence/sequelize/models/activity-log.model';
import { ActivityLogSequelizeAdapter } from './infrastructure/persistence/sequelize/activity-log-sequelize.adapter';
import { ActivityLogService } from './application/services/activity-log.service';
import { ActivityLogController } from './infrastructure/http/activity-log.controller';
import { ActivityLogInterceptor } from './infrastructure/http/activity-log.interceptor';

@Module({
  imports: [SequelizeModule.forFeature([ActivityLogModel])],
  providers: [
    {
      provide: 'IActivityLogRepository',
      useClass: ActivityLogSequelizeAdapter,
    },
    ActivityLogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    },
  ],
  controllers: [ActivityLogController],
  exports: ['IActivityLogRepository'],
})
export class ActivityLogModule {}
