import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../auth/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../auth/infrastructure/http/guards/roles.decorator';
import { ScheduleDefenseUseCase } from '../../../application/use-cases/schedule-defenses.use-case';
import { RescheduleDefenseUseCase } from '../../../application/use-cases/reschedule-defenses.use-case';
import { RealizeDefenseUseCase } from '../../../application/use-cases/realize-defenses.use-case';
import { CancelDefenseUseCase } from '../../../application/use-cases/cancel-defenses.use-case';
import {
  GetDefenseByIdUseCase,
  GetDefenseByProjectUseCase,
} from '../../../application/use-cases/get-defenses.use-case';
import { ScheduleDefenseDto } from '../dtos/schedule-defense.dto';
import { RescheduleDefenseDto } from '../dtos/reschedule-defense.dto';

@Controller('defenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DefenseController {
  constructor(
    private readonly scheduleDefenseUseCase: ScheduleDefenseUseCase,
    private readonly rescheduleDefenseUseCase: RescheduleDefenseUseCase,
    private readonly realizeDefenseUseCase: RealizeDefenseUseCase,
    private readonly cancelDefenseUseCase: CancelDefenseUseCase,
    private readonly getDefenseByIdUseCase: GetDefenseByIdUseCase,
    private readonly getDefenseByProjectUseCase: GetDefenseByProjectUseCase,
  ) {}

  @Post()
  @Roles('ADMIN')
  async schedule(@Body() dto: ScheduleDefenseDto) {
    return this.scheduleDefenseUseCase.execute({
      projectId: dto.projectId,
      scheduledDate: new Date(dto.scheduledDate),
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getDefenseByIdUseCase.execute(id);
  }

  @Get('project/:projectId')
  async getByProject(@Param('projectId') projectId: string) {
    return this.getDefenseByProjectUseCase.execute(projectId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  async reschedule(@Param('id') id: string, @Body() dto: RescheduleDefenseDto) {
    return this.rescheduleDefenseUseCase.execute({
      id,
      scheduledDate: new Date(dto.scheduledDate),
      reason: dto.reason,
      changedBy: dto.changedBy,
    });
  }

  @Patch(':id/realize')
  @Roles('ADMIN')
  async realize(@Param('id') id: string) {
    return this.realizeDefenseUseCase.execute(id);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN')
  async cancel(@Param('id') id: string) {
    return this.cancelDefenseUseCase.execute(id);
  }
}
