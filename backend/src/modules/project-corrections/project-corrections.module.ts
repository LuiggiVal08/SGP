import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectCorrectionModel } from './infrastructure/persistence/sequelize/models/project-correction.model';
import { ProjectCorrectionSequelizeAdapter } from './infrastructure/persistence/sequelize/project-correction-sequelize.adapter';
import { CreateProjectCorrectionUseCase } from './application/use-cases/create-project-correction.use-case';
import { GetProjectCorrectionsUseCase } from './application/use-cases/get-project-corrections.use-case';
import { ResolveProjectCorrectionUseCase } from './application/use-cases/resolve-project-correction.use-case';
import { DeleteProjectCorrectionUseCase } from './application/use-cases/delete-project-correction.use-case';
import { ProjectCorrectionController } from './infrastructure/http/controllers/project-correction.controller';
import { ProjectsModule } from '@modules/projects/projects.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ProjectCorrectionModel]),
    forwardRef(() => ProjectsModule),
  ],
  providers: [
    {
      provide: 'IProjectCorrectionRepository',
      useClass: ProjectCorrectionSequelizeAdapter,
    },
    CreateProjectCorrectionUseCase,
    GetProjectCorrectionsUseCase,
    ResolveProjectCorrectionUseCase,
    DeleteProjectCorrectionUseCase,
  ],
  controllers: [ProjectCorrectionController],
  exports: ['IProjectCorrectionRepository'],
})
export class ProjectCorrectionsModule {}
