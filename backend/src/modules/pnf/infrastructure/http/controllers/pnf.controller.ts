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
import { GetAllPnfUseCase } from '../../../application/use-cases/get-all-pnf.use-case';
import { CreatePnfUseCase } from '../../../application/use-cases/create-pnf.use-case';
import { UpdatePnfUseCase } from '../../../application/use-cases/update-pnf.use-case';
import { DeletePnfUseCase } from '../../../application/use-cases/delete-pnf.use-case';
import { CreatePnfDto } from '../dtos/create-pnf.dto';
import { UpdatePnfDto } from '../dtos/update-pnf.dto';
import { PaginationDto } from '@share/application/dtos/pagination.dto';

@ApiTags('PNF')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pnf')
export class PnfController {
  constructor(
    private readonly getAllPnfUseCase: GetAllPnfUseCase,
    private readonly createPnfUseCase: CreatePnfUseCase,
    private readonly updatePnfUseCase: UpdatePnfUseCase,
    private readonly deletePnfUseCase: DeletePnfUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar PNFs',
    description:
      'Obtiene todas las PNFs, con paginación opcional y filtro por institución',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('institutionId') institutionId?: string,
  ): Promise<any> {
    const dto: PaginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search || undefined,
    };
    return this.getAllPnfUseCase.execute(dto, institutionId);
  }

  @Post()
  @Roles('ADMIN')
  @LogActivity('CREATE', 'PNF')
  @ApiOperation({
    summary: 'Crear PNF',
    description: 'Registra una nueva PNF',
  })
  async create(@Body() dto: CreatePnfDto) {
    return this.createPnfUseCase.execute(
      dto.name,
      dto.institutionId,
      dto.coordinatorId,
    );
  }

  @Patch(':id')
  @Roles('ADMIN')
  @LogActivity('UPDATE', 'PNF')
  @ApiOperation({
    summary: 'Actualizar PNF',
    description: 'Actualiza el nombre y/o la institución de una PNF',
  })
  async update(@Param('id') id: string, @Body() dto: UpdatePnfDto) {
    return this.updatePnfUseCase.execute(
      id,
      dto.name,
      dto.institutionId,
      dto.coordinatorId,
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  @LogActivity('DELETE', 'PNF')
  @ApiOperation({
    summary: 'Eliminar PNF',
    description:
      'Elimina una PNF (solo si no tiene usuarios o proyectos asociados)',
  })
  async delete(@Param('id') id: string) {
    return this.deletePnfUseCase.execute(id);
  }
}
