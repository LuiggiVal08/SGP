import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DefenseModel } from './infrastructure/persistence/sequelize/models/defense.model';
import { DefenseScheduleChangeModel } from './infrastructure/persistence/sequelize/models/defense-schedule-change.model';
import { DefenseSequelizeAdapter } from './infrastructure/persistence/sequelize/defense-sequelize.adapter';
import { DefenseScheduleChangeSequelizeAdapter } from './infrastructure/persistence/sequelize/defense-schedule-change-sequelize.adapter';
import { ScheduleDefenseUseCase } from './application/use-cases/schedule-defenses.use-case';
import { RescheduleDefenseUseCase } from './application/use-cases/reschedule-defenses.use-case';
import { RealizeDefenseUseCase } from './application/use-cases/realize-defenses.use-case';
import { CancelDefenseUseCase } from './application/use-cases/cancel-defenses.use-case';
import {
  GetDefenseByIdUseCase,
  GetDefenseByProjectUseCase,
  GetAllDefensesUseCase,
} from './application/use-cases/get-defenses.use-case';
import { DefenseController } from './infrastructure/http/controllers/defense.controller';
import { ProjectsModule } from '@modules/projects/projects.module';

@Module({
  imports: [
    SequelizeModule.forFeature([DefenseModel, DefenseScheduleChangeModel]),
    forwardRef(() => ProjectsModule),
  ],
  providers: [
    {
      provide: 'IDefenseRepository',
      useClass: DefenseSequelizeAdapter,
    },
    {
      provide: 'IDefenseScheduleChangeRepository',
      useClass: DefenseScheduleChangeSequelizeAdapter,
    },
    ScheduleDefenseUseCase,
    RescheduleDefenseUseCase,
    RealizeDefenseUseCase,
    CancelDefenseUseCase,
    GetDefenseByIdUseCase,
    GetDefenseByProjectUseCase,
    GetAllDefensesUseCase,
  ],
  controllers: [DefenseController],
  exports: ['IDefenseRepository', 'IDefenseScheduleChangeRepository'],
})
export class DefensesModule {}
