import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectModel } from './infrastructure/persistence/sequelize/models/project.model';
import { ProjectFileModel } from './infrastructure/persistence/sequelize/models/project-file.model';
import { ProjectAuthorModel } from './infrastructure/persistence/sequelize/models/project-author.model';
import { ProjectSequelizeAdapter } from './infrastructure/persistence/sequelize/project-sequelize.adapter';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { UploadProjectFilesUseCase } from './application/use-cases/upload-project-files.use-case';
import { GetAllProjectsUseCase } from './application/use-cases/get-all-projects.use-case';
import { ProjectController } from './infrastructure/http/controllers/project.controller';
import { UsersModule } from '@modules/users/users.module';
import { CareersModule } from '@modules/careers/careers.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ProjectModel, ProjectFileModel, ProjectAuthorModel]),
    UsersModule,
    CareersModule,
  ],
  providers: [
    {
      provide: 'IProjectRepository',
      useClass: ProjectSequelizeAdapter,
    },
    CreateProjectUseCase,
    UploadProjectFilesUseCase,
    GetAllProjectsUseCase,
  ],
  controllers: [ProjectController],
})
export class ProjectsModule {}
