import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/infrastructure/http/guards/roles.decorator';
import { GetAllProjectSubjectAssignmentsUseCase } from '../../../application/use-cases/get-all-project-subject-assignments.use-case';
import { CreateProjectSubjectAssignmentUseCase } from '../../../application/use-cases/create-project-subject-assignment.use-case';
import { DeleteProjectSubjectAssignmentUseCase } from '../../../application/use-cases/delete-project-subject-assignment.use-case';
import { CreateProjectSubjectAssignmentDto } from '../dtos/create-project-subject-assignment.dto';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';
import { ProjectSubjectAssignment } from '../../domain/entities/ProjectSubjectAssignment';

@Controller('project-subject-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectSubjectAssignmentController {
  constructor(
    private readonly getAllUseCase: GetAllProjectSubjectAssignmentsUseCase,
    private readonly createUseCase: CreateProjectSubjectAssignmentUseCase,
    private readonly deleteUseCase: DeleteProjectSubjectAssignmentUseCase,
  ) {}

  @Get()
  async findAll(
    @Query() dto: PaginationDto,
  ): Promise<PaginatedResult<ProjectSubjectAssignment>> {
    return this.getAllUseCase.execute(dto);
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateProjectSubjectAssignmentDto) {
    return this.createUseCase.execute(dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteUseCase.execute(id);
  }
}
