import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InstitutionModel } from './infrastructure/persistence/sequelize/models/institution.model';
import { InstitutionSequelizeAdapter } from './infrastructure/persistence/sequelize/institution-sequelize.adapter';
import { GetAllInstitutionsUseCase } from './application/use-cases/get-all-institutions.use-case';
import { CreateInstitutionUseCase } from './application/use-cases/create-institution.use-case';
import { UpdateInstitutionUseCase } from './application/use-cases/update-institution.use-case';
import { InstitutionController } from './infrastructure/http/controllers/institution.controller';

@Module({
  imports: [SequelizeModule.forFeature([InstitutionModel])],
  providers: [
    {
      provide: 'IInstitutionRepository',
      useClass: InstitutionSequelizeAdapter,
    },
    GetAllInstitutionsUseCase,
    CreateInstitutionUseCase,
    UpdateInstitutionUseCase,
  ],
  controllers: [InstitutionController],
  exports: ['IInstitutionRepository'],
})
export class InstitutionsModule {}
