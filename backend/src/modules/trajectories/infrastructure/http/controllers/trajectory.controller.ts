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
import { GetAllTrajectoriesUseCase } from '../../../application/use-cases/get-all-trajectories.use-case';
import { CreateTrajectoryUseCase } from '../../../application/use-cases/create-trajectory.use-case';
import { UpdateTrajectoryUseCase } from '../../../application/use-cases/update-trajectory.use-case';
import { DeleteTrajectoryUseCase } from '../../../application/use-cases/delete-trajectory.use-case';
import { CreateTrajectoryDto } from '../dtos/create-trajectory.dto';
import { UpdateTrajectoryDto } from '../dtos/update-trajectory.dto';
import { PaginationDto } from '@share/application/dtos/pagination.dto';

@ApiTags('Trajectories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trajectories')
export class TrajectoryController {
  constructor(
    private readonly getAllTrajectoriesUseCase: GetAllTrajectoriesUseCase,
    private readonly createTrajectoryUseCase: CreateTrajectoryUseCase,
    private readonly updateTrajectoryUseCase: UpdateTrajectoryUseCase,
    private readonly deleteTrajectoryUseCase: DeleteTrajectoryUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar trayectorias' })
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
    return this.getAllTrajectoriesUseCase.execute(dto);
  }

  @Post()
  @Roles('ADMIN')
  @LogActivity('CREATE', 'TRAJECTORY')
  @ApiOperation({ summary: 'Crear trayectoria' })
  async create(@Body() dto: CreateTrajectoryDto) {
    return this.createTrajectoryUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @LogActivity('UPDATE', 'TRAJECTORY')
  @ApiOperation({ summary: 'Actualizar trayectoria' })
  async update(@Param('id') id: string, @Body() dto: UpdateTrajectoryDto) {
    return this.updateTrajectoryUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @LogActivity('DELETE', 'TRAJECTORY')
  @ApiOperation({ summary: 'Eliminar trayectoria' })
  async delete(@Param('id') id: string) {
    return this.deleteTrajectoryUseCase.execute(id);
  }
}
