import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TagModel } from './infrastructure/persistence/sequelize/models/tag.model';
import { TagSequelizeAdapter } from './infrastructure/persistence/sequelize/tag-sequelize.adapter';
import { GetAllTagsUseCase } from './application/use-cases/get-all-tags.use-case';
import { CreateTagUseCase } from './application/use-cases/create-tag.use-case';
import { UpdateTagUseCase } from './application/use-cases/update-tag.use-case';
import { DeleteTagUseCase } from './application/use-cases/delete-tag.use-case';
import { TagController } from './infrastructure/http/controllers/tag.controller';

@Module({
  imports: [SequelizeModule.forFeature([TagModel])],
  providers: [
    {
      provide: 'ITagRepository',
      useClass: TagSequelizeAdapter,
    },
    GetAllTagsUseCase,
    CreateTagUseCase,
    UpdateTagUseCase,
    DeleteTagUseCase,
  ],
  controllers: [TagController],
  exports: ['ITagRepository'],
})
export class TagsModule {}
