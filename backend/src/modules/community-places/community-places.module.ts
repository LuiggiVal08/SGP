import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommunityPlaceModel } from './infrastructure/persistence/sequelize/models/community-place.model';
import { CommunityPlaceSequelizeAdapter } from './infrastructure/persistence/sequelize/community-place-sequelize.adapter';
import { GetAllCommunityPlacesUseCase } from './application/use-cases/get-all-community-places.use-case';
import { CreateCommunityPlaceUseCase } from './application/use-cases/create-community-place.use-case';
import { UpdateCommunityPlaceUseCase } from './application/use-cases/update-community-place.use-case';
import { DeleteCommunityPlaceUseCase } from './application/use-cases/delete-community-place.use-case';
import { CommunityPlaceController } from './infrastructure/http/controllers/community-place.controller';
import { InstitutionsModule } from '@modules/institutions/institutions.module';

@Module({
  imports: [
    SequelizeModule.forFeature([CommunityPlaceModel]),
    forwardRef(() => InstitutionsModule),
  ],
  providers: [
    {
      provide: 'ICommunityPlaceRepository',
      useClass: CommunityPlaceSequelizeAdapter,
    },
    GetAllCommunityPlacesUseCase,
    CreateCommunityPlaceUseCase,
    UpdateCommunityPlaceUseCase,
    DeleteCommunityPlaceUseCase,
  ],
  controllers: [CommunityPlaceController],
  exports: ['ICommunityPlaceRepository'],
})
export class CommunityPlacesModule {}
