import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TrajectoryModel } from './infrastructure/persistence/sequelize/models/trajectory.model';
import { TrajectorySequelizeAdapter } from './infrastructure/persistence/sequelize/trajectory-sequelize.adapter';
import { GetAllTrajectoriesUseCase } from './application/use-cases/get-all-trajectories.use-case';
import { CreateTrajectoryUseCase } from './application/use-cases/create-trajectory.use-case';
import { UpdateTrajectoryUseCase } from './application/use-cases/update-trajectory.use-case';
import { DeleteTrajectoryUseCase } from './application/use-cases/delete-trajectory.use-case';
import { TrajectoryController } from './infrastructure/http/controllers/trajectory.controller';
import { PnfModule } from '@modules/pnf/pnf.module';

@Module({
  imports: [
    SequelizeModule.forFeature([TrajectoryModel]),
    forwardRef(() => PnfModule),
  ],
  providers: [
    {
      provide: 'ITrajectoryRepository',
      useClass: TrajectorySequelizeAdapter,
    },
    GetAllTrajectoriesUseCase,
    CreateTrajectoryUseCase,
    UpdateTrajectoryUseCase,
    DeleteTrajectoryUseCase,
  ],
  controllers: [TrajectoryController],
  exports: ['ITrajectoryRepository'],
})
export class TrajectoriesModule {}
