import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectSubjectAssignmentModel } from './infrastructure/persistence/sequelize/models/project-subject-assignment.model';
import { ProjectSubjectAssignmentSequelizeAdapter } from './infrastructure/persistence/sequelize/project-subject-assignment-sequelize.adapter';
import { CreateProjectSubjectAssignmentUseCase } from './application/use-cases/create-project-subject-assignment.use-case';
import { GetAllProjectSubjectAssignmentsUseCase } from './application/use-cases/get-all-project-subject-assignments.use-case';
import { DeleteProjectSubjectAssignmentUseCase } from './application/use-cases/delete-project-subject-assignment.use-case';
import { ProjectSubjectAssignmentController } from './infrastructure/http/controllers/project-subject-assignment.controller';
import { SubjectsModule } from '@modules/subjects/subjects.module';
import { ProfessorsModule } from '@modules/professors/professors.module';
import { PeriodsModule } from '@modules/periods/periods.module';
import { ProjectsModule } from '@modules/projects/projects.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ProjectSubjectAssignmentModel]),
    forwardRef(() => SubjectsModule),
    forwardRef(() => ProfessorsModule),
    forwardRef(() => PeriodsModule),
    forwardRef(() => ProjectsModule),
  ],
  providers: [
    {
      provide: 'IProjectSubjectAssignmentRepository',
      useClass: ProjectSubjectAssignmentSequelizeAdapter,
    },
    CreateProjectSubjectAssignmentUseCase,
    GetAllProjectSubjectAssignmentsUseCase,
    DeleteProjectSubjectAssignmentUseCase,
  ],
  controllers: [ProjectSubjectAssignmentController],
  exports: ['IProjectSubjectAssignmentRepository'],
})
export class ProjectSubjectAssignmentsModule {}
