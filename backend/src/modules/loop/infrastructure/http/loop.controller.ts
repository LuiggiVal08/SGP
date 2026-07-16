import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/http/guards/roles.decorator';
import { LoopService } from '../../application/services/loop.service';
import type {
  LoopSnapshot,
  LoopState,
  LoopReceipt,
} from '../../application/services/loop.service';

@ApiTags('Loop Engineering')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loop')
export class LoopController {
  constructor(private readonly loopService: LoopService) {}

  @Get('state')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Estado del loop',
    description:
      'Snapshot del backlog, estado y recibos del agent loop (solo ADMIN)',
  })
  getSnapshot(): LoopSnapshot {
    return this.loopService.getSnapshot();
  }

  @Get('receipts')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Recibos de ciclos',
    description: 'Lista los recibos de ciclos del loop (solo ADMIN)',
  })
  getReceipts(): LoopReceipt[] {
    return this.loopService.getReceipts();
  }

  @Get('run-state')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Estado de ejecución',
    description: 'Estado durable de la última corrida (solo ADMIN)',
  })
  getRunState(): LoopState | null {
    return this.loopService.getState();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health del loop',
    description: 'Indica si la capa de orquestación del loop está operativa',
  })
  getHealth(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
