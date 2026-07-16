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
import { GetAllStudentsUseCase } from '../../../application/use-cases/get-all-students.use-case';
import { GetStudentByIdUseCase } from '../../../application/use-cases/get-student-by-id.use-case';
import { UpdateStudentUseCase } from '../../../application/use-cases/update-student.use-case';
import { DeleteStudentUseCase } from '../../../application/use-cases/delete-student.use-case';
import { UpdateStudentDto } from '../dtos/update-student.dto';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentController {
  constructor(
    private readonly getAllStudentsUseCase: GetAllStudentsUseCase,
    private readonly getStudentByIdUseCase: GetStudentByIdUseCase,
    private readonly updateStudentUseCase: UpdateStudentUseCase,
    private readonly deleteStudentUseCase: DeleteStudentUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar estudiantes (paginado)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<any> {
    return this.getAllStudentsUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search || undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estudiante por ID' })
  async findOne(@Param('id') id: string) {
    return this.getStudentByIdUseCase.execute(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @LogActivity('UPDATE', 'STUDENT')
  @ApiOperation({ summary: 'Actualizar estudiante (ADMIN)' })
  async update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.updateStudentUseCase.execute(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @LogActivity('DELETE', 'STUDENT')
  @ApiOperation({ summary: 'Eliminar estudiante (ADMIN)' })
  async remove(@Param('id') id: string) {
    return this.deleteStudentUseCase.execute(id);
  }
}
