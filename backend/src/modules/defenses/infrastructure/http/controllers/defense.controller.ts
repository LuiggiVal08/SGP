import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ScheduleDefenseUseCase } from '../../../application/use-cases/schedule-defenses.use-case';
import { RescheduleDefenseUseCase } from '../../../application/use-cases/reschedule-defenses.use-case';
import { RealizeDefenseUseCase } from '../../../application/use-cases/realize-defenses.use-case';
import { CancelDefenseUseCase } from '../../../application/use-cases/cancel-defenses.use-case';
import {
  GetDefenseByProjectUseCase,
  GetAllDefensesUseCase,
} from '../../../application/use-cases/get-defenses.use-case';
import { ScheduleDefenseDto } from '../dtos/schedule-defense.dto';
import { RescheduleDefenseDto } from '../dtos/reschedule-defense.dto';
import { Defense } from '../../../domain/entities/Defense';

@Controller('projects/:projectId/defenses')
export class DefenseController {
  constructor(
    private readonly scheduleDefenseUseCase: ScheduleDefenseUseCase,
    private readonly rescheduleDefenseUseCase: RescheduleDefenseUseCase,
    private readonly realizeDefenseUseCase: RealizeDefenseUseCase,
    private readonly cancelDefenseUseCase: CancelDefenseUseCase,
    private readonly getDefenseByProjectUseCase: GetDefenseByProjectUseCase,
    private readonly getAllDefensesUseCase: GetAllDefensesUseCase,
  ) {}

  @Post()
  async schedule(
    @Param('projectId') projectId: string,
    @Body() dto: ScheduleDefenseDto,
  ): Promise<Defense> {
    return this.scheduleDefenseUseCase.execute({
      projectId,
      scheduledDate: new Date(dto.scheduledDate),
    });
  }

  @Get()
  async getByProject(
    @Param('projectId') projectId: string,
  ): Promise<Defense | null> {
    return this.getDefenseByProjectUseCase.execute(projectId);
  }

  @Patch(':id/reschedule')
  async reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleDefenseDto,
  ): Promise<Defense> {
    return this.rescheduleDefenseUseCase.execute({
      id,
      scheduledDate: new Date(dto.scheduledDate),
    });
  }

  @Patch(':id/realize')
  async realize(@Param('id') id: string): Promise<Defense> {
    return this.realizeDefenseUseCase.execute(id);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string): Promise<Defense> {
    return this.cancelDefenseUseCase.execute(id);
  }
}
