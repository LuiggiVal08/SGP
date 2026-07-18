import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectModel } from './infrastructure/persistence/sequelize/models/project.model';
import { ProjectFileModel } from './infrastructure/persistence/sequelize/models/project-file.model';
import { ProjectAuthorModel } from './infrastructure/persistence/sequelize/models/project-author.model';
import { ProjectMilestoneModel } from './infrastructure/persistence/sequelize/models/project-milestone.model';
import { ProjectRevisionModel } from './infrastructure/persistence/sequelize/models/project-revision.model';
import { ProjectSequelizeAdapter } from './infrastructure/persistence/sequelize/project-sequelize.adapter';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case';
import { UploadProjectFilesUseCase } from './application/use-cases/upload-project-files.use-case';
import { GetAllProjectsUseCase } from './application/use-cases/get-all-projects.use-case';
import { GetDashboardStatsUseCase } from './application/use-cases/get-dashboard-stats.use-case';
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
import { ProjectScopeService } from './application/services/project-scope.service';
import { StudentsModule } from '@modules/students/students.module';
import { ProfessorsModule } from '@modules/professors/professors.module';
import { InstitutionsModule } from '@modules/institutions/institutions.module';
import { ProjectSubjectAssignmentsModule } from '@modules/project-subject-assignments/project-subject-assignments.module';
import { CommunityTutorsModule } from '@modules/community-tutors/community-tutors.module';
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
      ProjectMilestoneModel,
      ProjectRevisionModel,
      ProjectSubjectAssignmentModel,
      CommunityPlaceModel,
      CommunityTutorModel,
      ProfessorModel,
      ProjectAcademicTutorModel,
    ]),
    StudentsModule,
    ProfessorsModule,
    InstitutionsModule,
    ProjectSubjectAssignmentsModule,
    CommunityTutorsModule,
  ],
  providers: [
    {
      provide: 'IProjectRepository',
      useClass: ProjectSequelizeAdapter,
    },
    ProjectScopeService,
    CreateProjectUseCase,
    UpdateProjectUseCase,
    UploadProjectFilesUseCase,
    GetAllProjectsUseCase,
    GetDashboardStatsUseCase,
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
