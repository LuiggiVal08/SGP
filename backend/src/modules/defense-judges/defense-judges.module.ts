import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DefenseJudgeModel } from './infrastructure/persistence/sequelize/models/defense-judge.model';
import { DefenseJudgeSequelizeAdapter } from './infrastructure/persistence/sequelize/defense-judge-sequelize.adapter';
import { AssignJudgeUseCase } from './application/use-cases/assign-judge.use-case';
import {
  ListJudgesByDefenseUseCase,
  RemoveJudgeUseCase,
} from './application/use-cases/get-defense-judges.use-case';
import { DefenseJudgeController } from './infrastructure/http/controllers/defense-judge.controller';
import { DefensesModule } from '@modules/defenses/defenses.module';
import { ProfessorsModule } from '@modules/professors/professors.module';
import { CommunityTutorsModule } from '@modules/community-tutors/community-tutors.module';

@Module({
  imports: [
    SequelizeModule.forFeature([DefenseJudgeModel]),
    forwardRef(() => DefensesModule),
    forwardRef(() => ProfessorsModule),
    forwardRef(() => CommunityTutorsModule),
  ],
  providers: [
    {
      provide: 'IDefenseJudgeRepository',
      useClass: DefenseJudgeSequelizeAdapter,
    },
    AssignJudgeUseCase,
    ListJudgesByDefenseUseCase,
    RemoveJudgeUseCase,
  ],
  controllers: [DefenseJudgeController],
  exports: ['IDefenseJudgeRepository'],
})
export class DefenseJudgesModule {}
