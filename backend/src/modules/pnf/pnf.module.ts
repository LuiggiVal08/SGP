import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PnfModel } from './infrastructure/persistence/sequelize/models/pnf.model';
import { PnfSequelizeAdapter } from './infrastructure/persistence/sequelize/pnf-sequelize.adapter';
import { GetAllPnfUseCase } from './application/use-cases/get-all-pnf.use-case';
import { CreatePnfUseCase } from './application/use-cases/create-pnf.use-case';
import { UpdatePnfUseCase } from './application/use-cases/update-pnf.use-case';
import { DeletePnfUseCase } from './application/use-cases/delete-pnf.use-case';
import { PnfController } from './infrastructure/http/controllers/pnf.controller';
import { UsersModule } from '@modules/users/users.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { InstitutionsModule } from '@modules/institutions/institutions.module';
import { ProfessorsModule } from '@modules/professors/professors.module';

@Module({
  imports: [
    SequelizeModule.forFeature([PnfModel]),
    forwardRef(() => UsersModule),
    forwardRef(() => ProjectsModule),
    forwardRef(() => InstitutionsModule),
    forwardRef(() => ProfessorsModule),
  ],
  providers: [
    {
      provide: 'IPnfRepository',
      useClass: PnfSequelizeAdapter,
    },
    GetAllPnfUseCase,
    CreatePnfUseCase,
    UpdatePnfUseCase,
    DeletePnfUseCase,
  ],
  controllers: [PnfController],
  exports: ['IPnfRepository'],
})
export class PnfModule {}
