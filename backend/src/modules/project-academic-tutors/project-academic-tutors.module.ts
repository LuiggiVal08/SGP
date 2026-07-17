import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectAcademicTutorModel } from './infrastructure/persistence/sequelize/models/project-academic-tutor.model';
import { ProjectAcademicTutorSequelizeAdapter } from './infrastructure/persistence/sequelize/project-academic-tutor-sequelize.adapter';
import { AssignProjectAcademicTutorUseCase } from './application/use-cases/assign-project-academic-tutor.use-case';
import { ListProjectAcademicTutorsUseCase } from './application/use-cases/list-project-academic-tutors.use-case';
import { RemoveProjectAcademicTutorUseCase } from './application/use-cases/remove-project-academic-tutor.use-case';
import { ProjectAcademicTutorController } from './infrastructure/http/controllers/project-academic-tutor.controller';
import { ProjectsModule } from '@modules/projects/projects.module';
import { ProfessorsModule } from '@modules/professors/professors.module';
import { ProjectSubjectAssignmentsModule } from '@modules/project-subject-assignments/project-subject-assignments.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ProjectAcademicTutorModel]),
    forwardRef(() => ProjectsModule),
    forwardRef(() => ProfessorsModule),
    forwardRef(() => ProjectSubjectAssignmentsModule),
  ],
  providers: [
    {
      provide: 'IProjectAcademicTutorRepository',
      useClass: ProjectAcademicTutorSequelizeAdapter,
    },
    AssignProjectAcademicTutorUseCase,
    ListProjectAcademicTutorsUseCase,
    RemoveProjectAcademicTutorUseCase,
  ],
  controllers: [ProjectAcademicTutorController],
  exports: ['IProjectAcademicTutorRepository'],
})
export class ProjectAcademicTutorsModule {}
