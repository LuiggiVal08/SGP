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
import { CreateProjectCorrectionUseCase } from '../../../application/use-cases/create-project-correction.use-case';
import { GetProjectCorrectionsUseCase } from '../../../application/use-cases/get-project-corrections.use-case';
import { ResolveProjectCorrectionUseCase } from '../../../application/use-cases/resolve-project-correction.use-case';
import { DeleteProjectCorrectionUseCase } from '../../../application/use-cases/delete-project-correction.use-case';
import { CreateProjectCorrectionDto } from '../dtos/create-project-correction.dto';
import { PaginationDto } from '@share/application/dtos/pagination.dto';

@ApiTags('Project Corrections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects/:projectId/corrections')
export class ProjectCorrectionController {
  constructor(
    private readonly createProjectCorrectionUseCase: CreateProjectCorrectionUseCase,
    private readonly getProjectCorrectionsUseCase: GetProjectCorrectionsUseCase,
    private readonly resolveProjectCorrectionUseCase: ResolveProjectCorrectionUseCase,
    private readonly deleteProjectCorrectionUseCase: DeleteProjectCorrectionUseCase,
  ) {}

  @Post()
  @LogActivity('CREATE', 'PROJECT_CORRECTION')
  @ApiOperation({
    summary: 'Crear corrección sobre el TOMO',
    description: 'Registra una corrección sobre un archivo TOMO del proyecto',
  })
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectCorrectionDto,
  ) {
    return this.createProjectCorrectionUseCase.execute({
      projectId,
      fileId: dto.fileId,
      comment: dto.comment,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Listar correcciones del proyecto',
    description: 'Lista las correcciones paginadas de un proyecto',
  })
  async findAll(
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<any> {
    const dto: PaginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search || undefined,
    };
    return this.getProjectCorrectionsUseCase.execute(projectId, dto);
  }

  @Patch(':id/resolve')
  @LogActivity('UPDATE', 'PROJECT_CORRECTION')
  @ApiOperation({
    summary: 'Marcar corrección como resuelta',
    description:
      'Cambia el estado de la corrección a RESUELTA y fija resolvedAt',
  })
  async resolve(@Param('id') id: string) {
    return this.resolveProjectCorrectionUseCase.execute(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @LogActivity('DELETE', 'PROJECT_CORRECTION')
  @ApiOperation({
    summary: 'Eliminar corrección (solo ADMIN)',
    description: 'Elimina una corrección del proyecto',
  })
  async delete(@Param('id') id: string) {
    return this.deleteProjectCorrectionUseCase.execute(id);
  }
}
