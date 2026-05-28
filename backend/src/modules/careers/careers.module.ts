import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CareerModel } from './infrastructure/persistence/sequelize/models/career.model';
import { CareerSequelizeAdapter } from './infrastructure/persistence/sequelize/career-sequelize.adapter';
import { GetAllCareersUseCase } from './application/use-cases/get-all-careers.use-case';
import { CreateCareerUseCase } from './application/use-cases/create-career.use-case';
import { UpdateCareerUseCase } from './application/use-cases/update-career.use-case';
import { CareerController } from './infrastructure/http/controllers/career.controller';

@Module({
  imports: [SequelizeModule.forFeature([CareerModel])],
  providers: [
    {
      provide: 'ICareerRepository',
      useClass: CareerSequelizeAdapter,
    },
    GetAllCareersUseCase,
    CreateCareerUseCase,
    UpdateCareerUseCase,
  ],
  controllers: [CareerController],
  exports: ['ICareerRepository'],
})
export class CareersModule {}
