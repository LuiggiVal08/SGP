import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectModel } from './infrastructure/persistence/sequelize/models/project.model';
import { ProjectFileModel } from './infrastructure/persistence/sequelize/models/project-file.model';
import { ProjectAuthorModel } from './infrastructure/persistence/sequelize/models/project-author.model';
import { ProjectMilestoneModel } from './infrastructure/persistence/sequelize/models/project-milestone.model';
import { ProjectRevisionModel } from './infrastructure/persistence/sequelize/models/project-revision.model';
import { ProjectSequelizeAdapter } from './infrastructure/persistence/sequelize/project-sequelize.adapter';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { UploadProjectFilesUseCase } from './application/use-cases/upload-project-files.use-case';
import { GetAllProjectsUseCase } from './application/use-cases/get-all-projects.use-case';
import { GetProjectByIdUseCase } from './application/use-cases/get-project-by-id.use-case';
import { DeleteProjectUseCase } from './application/use-cases/delete-project.use-case';
import { GetProjectFilesUseCase } from './application/use-cases/get-project-files.use-case';
import { DeleteProjectFileUseCase } from './application/use-cases/delete-project-file.use-case';
import { CreateMilestonesUseCase } from './application/use-cases/create-milestones.use-case';
import { GetMilestonesUseCase } from './application/use-cases/get-milestones.use-case';
import { UpdateMilestoneStatusUseCase } from './application/use-cases/update-milestone-status.use-case';
import { CreateRevisionUseCase } from './application/use-cases/create-revision.use-case';
import { GetRevisionsUseCase } from './application/use-cases/get-revisions.use-case';
import { AddProjectAuthorUseCase } from './application/use-cases/add-project-author.use-case';
import { ListProjectAuthorsUseCase } from './application/use-cases/list-project-authors.use-case';
import { RemoveProjectAuthorUseCase } from './application/use-cases/remove-project-author.use-case';
import { ProjectController } from './infrastructure/http/controllers/project.controller';
import { StudentsModule } from '@modules/students/students.module';
import { ProjectSubjectAssignmentsModule } from '@modules/project-subject-assignments/project-subject-assignments.module';
import { CommunityTutorsModule } from '@modules/community-tutors/community-tutors.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ProjectModel,
      ProjectFileModel,
      ProjectAuthorModel,
      ProjectMilestoneModel,
      ProjectRevisionModel,
    ]),
    StudentsModule,
    ProjectSubjectAssignmentsModule,
    CommunityTutorsModule,
  ],
  providers: [
    {
      provide: 'IProjectRepository',
      useClass: ProjectSequelizeAdapter,
    },
    CreateProjectUseCase,
    UploadProjectFilesUseCase,
    GetAllProjectsUseCase,
    GetProjectByIdUseCase,
    DeleteProjectUseCase,
    GetProjectFilesUseCase,
    DeleteProjectFileUseCase,
    CreateMilestonesUseCase,
    GetMilestonesUseCase,
    UpdateMilestoneStatusUseCase,
    CreateRevisionUseCase,
    GetRevisionsUseCase,
    AddProjectAuthorUseCase,
    ListProjectAuthorsUseCase,
    RemoveProjectAuthorUseCase,
  ],
  controllers: [ProjectController],
  exports: ['IProjectRepository', SequelizeModule],
})
export class ProjectsModule {}
