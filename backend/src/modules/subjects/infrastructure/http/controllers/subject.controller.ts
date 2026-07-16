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
import { GetAllSubjectsUseCase } from '../../../application/use-cases/get-all-subjects.use-case';
import { CreateSubjectUseCase } from '../../../application/use-cases/create-subject.use-case';
import { UpdateSubjectUseCase } from '../../../application/use-cases/update-subject.use-case';
import { DeleteSubjectUseCase } from '../../../application/use-cases/delete-subject.use-case';
import { CreateSubjectDto } from '../dtos/create-subject.dto';
import { UpdateSubjectDto } from '../dtos/update-subject.dto';
import { PaginationDto } from '@share/application/dtos/pagination.dto';

@ApiTags('Subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectController {
  constructor(
    private readonly getAllSubjectsUseCase: GetAllSubjectsUseCase,
    private readonly createSubjectUseCase: CreateSubjectUseCase,
    private readonly updateSubjectUseCase: UpdateSubjectUseCase,
    private readonly deleteSubjectUseCase: DeleteSubjectUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar materias' })
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
    return this.getAllSubjectsUseCase.execute(dto);
  }

  @Post()
  @Roles('ADMIN')
  @LogActivity('CREATE', 'SUBJECT')
  @ApiOperation({ summary: 'Crear materia' })
  async create(@Body() dto: CreateSubjectDto) {
    return this.createSubjectUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @LogActivity('UPDATE', 'SUBJECT')
  @ApiOperation({ summary: 'Actualizar materia' })
  async update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.updateSubjectUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @LogActivity('DELETE', 'SUBJECT')
  @ApiOperation({ summary: 'Eliminar materia' })
  async delete(@Param('id') id: string) {
    return this.deleteSubjectUseCase.execute(id);
  }
}
