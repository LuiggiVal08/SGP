import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../auth/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../auth/infrastructure/http/guards/roles.decorator';
import {
  SubmitEvaluationUseCase,
  ListEvaluationsByDefenseUseCase,
} from '../../../application/use-cases/defense-evaluation.use-cases';
import { SubmitEvaluationDto } from '../dtos/submit-evaluation.dto';

@Controller('defenses/:defenseId/evaluations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DefenseEvaluationController {
  constructor(
    private readonly submitEvaluationUseCase: SubmitEvaluationUseCase,
    private readonly listEvaluationsByDefenseUseCase: ListEvaluationsByDefenseUseCase,
  ) {}

  @Post()
  @Roles('ADMIN')
  async submit(
    @Param('defenseId') defenseId: string,
    @Body() dto: SubmitEvaluationDto,
  ) {
    return this.submitEvaluationUseCase.execute({
      judgeId: dto.judgeId,
      score: dto.score,
      comments: dto.comments ?? '',
    });
  }

  @Get()
  async list(@Param('defenseId') defenseId: string) {
    return this.listEvaluationsByDefenseUseCase.execute(defenseId);
  }
}
