import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DefenseModel } from './infrastructure/persistence/sequelize/models/defense.model';
import { DefenseSequelizeAdapter } from './infrastructure/persistence/sequelize/defense-sequelize.adapter';
import { ScheduleDefenseUseCase } from './application/use-cases/schedule-defenses.use-case';
import { RescheduleDefenseUseCase } from './application/use-cases/reschedule-defenses.use-case';
import { RealizeDefenseUseCase } from './application/use-cases/realize-defenses.use-case';
import { CancelDefenseUseCase } from './application/use-cases/cancel-defenses.use-case';
import {
  GetDefenseByProjectUseCase,
  GetAllDefensesUseCase,
} from './application/use-cases/get-defenses.use-case';
import { DefenseController } from './infrastructure/http/controllers/defense.controller';
import { ProjectsModule } from '@modules/projects/projects.module';

@Module({
  imports: [
    SequelizeModule.forFeature([DefenseModel]),
    forwardRef(() => ProjectsModule),
  ],
  providers: [
    {
      provide: 'IDefenseRepository',
      useClass: DefenseSequelizeAdapter,
    },
    ScheduleDefenseUseCase,
    RescheduleDefenseUseCase,
    RealizeDefenseUseCase,
    CancelDefenseUseCase,
    GetDefenseByProjectUseCase,
    GetAllDefensesUseCase,
  ],
  controllers: [DefenseController],
  exports: ['IDefenseRepository'],
})
export class DefensesModule {}
