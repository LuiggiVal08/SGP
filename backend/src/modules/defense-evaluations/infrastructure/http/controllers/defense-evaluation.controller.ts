import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import {
  SubmitEvaluationUseCase,
  ListEvaluationsByJudgeUseCase,
  GetAllEvaluationsUseCase,
} from '../../../application/use-cases/defense-evaluation.use-cases';
import { SubmitEvaluationDto } from '../dtos/submit-evaluation.dto';

@Controller('defense-judges/:judgeId/evaluations')
export class DefenseEvaluationController {
  constructor(
    private readonly submitEvaluationUseCase: SubmitEvaluationUseCase,
    private readonly listEvaluationsByJudgeUseCase: ListEvaluationsByJudgeUseCase,
    private readonly getAllEvaluationsUseCase: GetAllEvaluationsUseCase,
  ) {}

  @Post()
  async submit(
    @Param('judgeId') judgeId: string,
    @Body() dto: SubmitEvaluationDto,
  ) {
    return this.submitEvaluationUseCase.execute({
      judgeId,
      score: dto.score,
      comments: dto.comments ?? '',
    });
  }

  @Get()
  async list(@Param('judgeId') judgeId: string) {
    return this.listEvaluationsByJudgeUseCase.execute(judgeId);
  }
}
