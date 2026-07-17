import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PeriodModel } from './infrastructure/persistence/sequelize/models/period.model';
import { PeriodSequelizeAdapter } from './infrastructure/persistence/sequelize/period-sequelize.adapter';
import { GetAllPeriodsUseCase } from './application/use-cases/get-all-periods.use-case';
import { CreatePeriodUseCase } from './application/use-cases/create-period.use-case';
import { UpdatePeriodUseCase } from './application/use-cases/update-period.use-case';
import { DeletePeriodUseCase } from './application/use-cases/delete-period.use-case';
import { PeriodController } from './infrastructure/http/controllers/period.controller';

@Module({
  imports: [SequelizeModule.forFeature([PeriodModel])],
  providers: [
    {
      provide: 'IPeriodRepository',
      useClass: PeriodSequelizeAdapter,
    },
    GetAllPeriodsUseCase,
    CreatePeriodUseCase,
    UpdatePeriodUseCase,
    DeletePeriodUseCase,
  ],
  controllers: [PeriodController],
  exports: ['IPeriodRepository'],
})
export class PeriodsModule {}
