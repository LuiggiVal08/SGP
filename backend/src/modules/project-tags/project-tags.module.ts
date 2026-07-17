import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectTagModel } from './infrastructure/persistence/sequelize/models/project-tag.model';
import { ProjectTagSequelizeAdapter } from './infrastructure/persistence/sequelize/project-tag-sequelize.adapter';
import { GetProjectTagsUseCase } from './application/use-cases/get-project-tags.use-case';
import { AssignTagUseCase } from './application/use-cases/assign-tag.use-case';
import { RemoveTagUseCase } from './application/use-cases/remove-tag.use-case';
import { ProjectTagController } from './infrastructure/http/controllers/project-tag.controller';
import { ProjectsModule } from '@modules/projects/projects.module';
import { TagsModule } from '@modules/tags/tags.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ProjectTagModel]),
    forwardRef(() => ProjectsModule),
    forwardRef(() => TagsModule),
  ],
  providers: [
    {
      provide: 'IProjectTagRepository',
      useClass: ProjectTagSequelizeAdapter,
    },
    GetProjectTagsUseCase,
    AssignTagUseCase,
    RemoveTagUseCase,
  ],
  controllers: [ProjectTagController],
  exports: ['IProjectTagRepository'],
})
export class ProjectTagsModule {}
