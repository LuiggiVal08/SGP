import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommunityTutorModel } from './infrastructure/persistence/sequelize/models/community-tutor.model';
import { CommunityTutorSequelizeAdapter } from './infrastructure/persistence/sequelize/community-tutor-sequelize.adapter';
import { GetAllCommunityTutorsUseCase } from './application/use-cases/get-all-community-tutors.use-case';
import { CreateCommunityTutorUseCase } from './application/use-cases/create-community-tutor.use-case';
import { UpdateCommunityTutorUseCase } from './application/use-cases/update-community-tutor.use-case';
import { DeleteCommunityTutorUseCase } from './application/use-cases/delete-community-tutor.use-case';
import { CommunityTutorController } from './infrastructure/http/controllers/community-tutor.controller';
import { CommunityPlacesModule } from '@modules/community-places/community-places.module';

@Module({
  imports: [
    SequelizeModule.forFeature([CommunityTutorModel]),
    forwardRef(() => CommunityPlacesModule),
  ],
  providers: [
    {
      provide: 'ICommunityTutorRepository',
      useClass: CommunityTutorSequelizeAdapter,
    },
    GetAllCommunityTutorsUseCase,
    CreateCommunityTutorUseCase,
    UpdateCommunityTutorUseCase,
    DeleteCommunityTutorUseCase,
  ],
  controllers: [CommunityTutorController],
  exports: ['ICommunityTutorRepository'],
})
export class CommunityTutorsModule {}
