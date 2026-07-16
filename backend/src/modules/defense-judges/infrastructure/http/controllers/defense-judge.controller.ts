import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { AssignJudgeUseCase } from '../../../application/use-cases/assign-judge.use-case';
import {
  ListJudgesByDefenseUseCase,
  RemoveJudgeUseCase,
} from '../../../application/use-cases/get-defense-judges.use-case';
import { AssignJudgeDto } from '../dtos/assign-judge.dto';

@Controller('defenses/:defenseId/judges')
export class DefenseJudgeController {
  constructor(
    private readonly assignJudgeUseCase: AssignJudgeUseCase,
    private readonly listJudgesByDefenseUseCase: ListJudgesByDefenseUseCase,
    private readonly removeJudgeUseCase: RemoveJudgeUseCase,
  ) {}

  @Post()
  async assign(
    @Param('defenseId') defenseId: string,
    @Body() dto: AssignJudgeDto,
  ) {
    return this.assignJudgeUseCase.execute({
      defenseId,
      judgeType: dto.judgeType,
      professorId: dto.professorId ?? null,
      communityTutorId: dto.communityTutorId ?? null,
    });
  }

  @Get()
  async list(@Param('defenseId') defenseId: string) {
    return this.listJudgesByDefenseUseCase.execute(defenseId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.removeJudgeUseCase.execute(id);
  }
}
