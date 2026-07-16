import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfessorModel } from './infrastructure/persistence/sequelize/models/professor.model';
import { ProfessorSequelizeAdapter } from './infrastructure/persistence/sequelize/professor-sequelize.adapter';
import { GetAllProfessorsUseCase } from './application/use-cases/get-all-professors.use-case';
import { GetProfessorProfileUseCase } from './application/use-cases/get-professor-profile.use-case';
import { UpdateProfessorUseCase } from './application/use-cases/update-professor.use-case';
import { DeleteProfessorUseCase } from './application/use-cases/delete-professor.use-case';
import { ProfessorController } from './infrastructure/http/controllers/professor.controller';
import { ProjectSubjectAssignmentsModule } from '@modules/project-subject-assignments/project-subject-assignments.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ProfessorModel]),
    ProjectSubjectAssignmentsModule,
  ],
  providers: [
    {
      provide: 'IProfessorRepository',
      useClass: ProfessorSequelizeAdapter,
    },
    GetAllProfessorsUseCase,
    GetProfessorProfileUseCase,
    UpdateProfessorUseCase,
    DeleteProfessorUseCase,
  ],
  controllers: [ProfessorController],
  exports: ['IProfessorRepository'],
})
export class ProfessorsModule {}
