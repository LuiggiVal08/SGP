import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfessorModel } from './infrastructure/persistence/sequelize/models/professor.model';
import { ProfessorSequelizeAdapter } from './infrastructure/persistence/sequelize/professor-sequelize.adapter';

@Module({
  imports: [SequelizeModule.forFeature([ProfessorModel])],
  providers: [
    {
      provide: 'IProfessorRepository',
      useClass: ProfessorSequelizeAdapter,
    },
  ],
  exports: ['IProfessorRepository', SequelizeModule],
})
export class ProfessorsModule {}
