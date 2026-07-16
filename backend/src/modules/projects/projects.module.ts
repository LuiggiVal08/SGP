import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectModel } from './infrastructure/persistence/sequelize/models/project.model';
import { ProjectFileModel } from './infrastructure/persistence/sequelize/models/project-file.model';
import { ProjectAuthorModel } from './infrastructure/persistence/sequelize/models/project-author.model';
import { ProjectSequelizeAdapter } from './infrastructure/persistence/sequelize/project-sequelize.adapter';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case';
import { UploadProjectFilesUseCase } from './application/use-cases/upload-project-files.use-case';
import { GetAllProjectsUseCase } from './application/use-cases/get-all-projects.use-case';
import { ProjectController } from './infrastructure/http/controllers/project.controller';
import { ProjectSubjectAssignmentModel } from '@modules/project-subject-assignments/infrastructure/persistence/sequelize/models/project-subject-assignment.model';
import { CommunityPlaceModel } from '@modules/community-places/infrastructure/persistence/sequelize/models/community-place.model';
import { CommunityTutorModel } from '@modules/community-tutors/infrastructure/persistence/sequelize/models/community-tutor.model';
import { ProfessorModel } from '@modules/professors/infrastructure/persistence/sequelize/models/professor.model';
import { ProjectAcademicTutorModel } from '@modules/project-academic-tutors/infrastructure/persistence/sequelize/models/project-academic-tutor.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ProjectModel,
      ProjectFileModel,
      ProjectAuthorModel,
      ProjectSubjectAssignmentModel,
      CommunityPlaceModel,
      CommunityTutorModel,
      ProfessorModel,
      ProjectAcademicTutorModel,
    ]),
  ],
  providers: [
    {
      provide: 'IProjectRepository',
      useClass: ProjectSequelizeAdapter,
    },
    CreateProjectUseCase,
    UpdateProjectUseCase,
    UploadProjectFilesUseCase,
    GetAllProjectsUseCase,
  ],
  controllers: [ProjectController],
  exports: ['IProjectRepository'],
})
export class ProjectsModule {}
