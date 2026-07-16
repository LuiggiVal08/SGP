import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DefenseEvaluationModel } from './infrastructure/persistence/sequelize/models/defense-evaluation.model';
import { DefenseEvaluationSequelizeAdapter } from './infrastructure/persistence/sequelize/defense-evaluation-sequelize.adapter';
import {
  SubmitEvaluationUseCase,
  ListEvaluationsByJudgeUseCase,
  GetAllEvaluationsUseCase,
} from './application/use-cases/defense-evaluation.use-cases';
import { DefenseEvaluationController } from './infrastructure/http/controllers/defense-evaluation.controller';
import { DefenseJudgesModule } from '@modules/defense-judges/defense-judges.module';

@Module({
  imports: [
    SequelizeModule.forFeature([DefenseEvaluationModel]),
    forwardRef(() => DefenseJudgesModule),
  ],
  providers: [
    {
      provide: 'IDefenseEvaluationRepository',
      useClass: DefenseEvaluationSequelizeAdapter,
    },
    SubmitEvaluationUseCase,
    ListEvaluationsByJudgeUseCase,
    GetAllEvaluationsUseCase,
  ],
  controllers: [DefenseEvaluationController],
  exports: ['IDefenseEvaluationRepository'],
})
export class DefenseEvaluationsModule {}
