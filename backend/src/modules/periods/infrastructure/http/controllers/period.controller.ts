import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../auth/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../auth/infrastructure/http/guards/roles.decorator';
import { LogActivity } from '../../../../activity-log/infrastructure/http/log-activity.decorator';
import { GetAllPeriodsUseCase } from '../../../application/use-cases/get-all-periods.use-case';
import { CreatePeriodUseCase } from '../../../application/use-cases/create-period.use-case';
import { UpdatePeriodUseCase } from '../../../application/use-cases/update-period.use-case';
import { DeletePeriodUseCase } from '../../../application/use-cases/delete-period.use-case';
import { CreatePeriodDto } from '../dtos/create-period.dto';
import { UpdatePeriodDto } from '../dtos/update-period.dto';
import { PaginationDto } from '@share/application/dtos/pagination.dto';

@ApiTags('Periods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('periods')
export class PeriodController {
  constructor(
    private readonly getAllPeriodsUseCase: GetAllPeriodsUseCase,
    private readonly createPeriodUseCase: CreatePeriodUseCase,
    private readonly updatePeriodUseCase: UpdatePeriodUseCase,
    private readonly deletePeriodUseCase: DeletePeriodUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar periodos',
    description: 'Obtiene todos los periodos, con paginación opcional',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<any> {
    const dto: PaginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search || undefined,
    };
    return this.getAllPeriodsUseCase.execute(dto);
  }

  @Post()
  @Roles('ADMIN')
  @LogActivity('CREATE', 'PERIOD')
  @ApiOperation({
    summary: 'Crear periodo',
    description: 'Registra un nuevo periodo académico',
  })
  async create(@Body() dto: CreatePeriodDto) {
    return this.createPeriodUseCase.execute({
      name: dto.name,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      isActive: dto.isActive,
    });
  }

  @Patch(':id')
  @Roles('ADMIN')
  @LogActivity('UPDATE', 'PERIOD')
  @ApiOperation({
    summary: 'Actualizar periodo',
    description: 'Actualiza los datos de un periodo',
  })
  async update(@Param('id') id: string, @Body() dto: UpdatePeriodDto) {
    return this.updatePeriodUseCase.execute(id, {
      name: dto.name,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      isActive: dto.isActive,
    });
  }

  @Delete(':id')
  @Roles('ADMIN')
  @LogActivity('DELETE', 'PERIOD')
  @ApiOperation({
    summary: 'Eliminar periodo',
    description: 'Elimina un periodo (solo si no tiene asignaciones asociadas)',
  })
  async delete(@Param('id') id: string) {
    return this.deletePeriodUseCase.execute(id);
  }
}
