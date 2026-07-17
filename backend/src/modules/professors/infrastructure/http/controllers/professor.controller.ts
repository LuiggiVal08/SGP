import {
  Controller,
  Get,
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
import { GetAllProfessorsUseCase } from '../../../application/use-cases/get-all-professors.use-case';
import { GetProfessorProfileUseCase } from '../../../application/use-cases/get-professor-profile.use-case';
import { UpdateProfessorUseCase } from '../../../application/use-cases/update-professor.use-case';
import { DeleteProfessorUseCase } from '../../../application/use-cases/delete-professor.use-case';
import { UpdateProfessorDto } from '../dtos/update-professor.dto';

@ApiTags('Professors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('professors')
export class ProfessorController {
  constructor(
    private readonly getAllProfessorsUseCase: GetAllProfessorsUseCase,
    private readonly getProfessorProfileUseCase: GetProfessorProfileUseCase,
    private readonly updateProfessorUseCase: UpdateProfessorUseCase,
    private readonly deleteProfessorUseCase: DeleteProfessorUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar profesores (paginado)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<any> {
    return this.getAllProfessorsUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search || undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener perfil de profesor' })
  async findOne(@Param('id') id: string) {
    return this.getProfessorProfileUseCase.execute(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @LogActivity('UPDATE', 'PROFESSOR')
  @ApiOperation({ summary: 'Actualizar profesor (ADMIN)' })
  async update(@Param('id') id: string, @Body() dto: UpdateProfessorDto) {
    return this.updateProfessorUseCase.execute(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @LogActivity('DELETE', 'PROFESSOR')
  @ApiOperation({ summary: 'Eliminar profesor (ADMIN)' })
  async remove(@Param('id') id: string) {
    return this.deleteProfessorUseCase.execute(id);
  }
}
