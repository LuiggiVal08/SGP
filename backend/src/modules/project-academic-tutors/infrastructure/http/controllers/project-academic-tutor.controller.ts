import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/infrastructure/http/guards/roles.guard';
import { Roles } from '@modules/auth/infrastructure/http/guards/roles.decorator';
import { AssignProjectAcademicTutorUseCase } from '../../../application/use-cases/assign-project-academic-tutor.use-case';
import { ListProjectAcademicTutorsUseCase } from '../../../application/use-cases/list-project-academic-tutors.use-case';
import { RemoveProjectAcademicTutorUseCase } from '../../../application/use-cases/remove-project-academic-tutor.use-case';
import { ProjectAcademicTutor } from '../../../domain/entities/ProjectAcademicTutor';

@Controller('projects/:projectId/academic-tutors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectAcademicTutorController {
  constructor(
    private readonly assignUseCase: AssignProjectAcademicTutorUseCase,
    private readonly listUseCase: ListProjectAcademicTutorsUseCase,
    private readonly removeUseCase: RemoveProjectAcademicTutorUseCase,
  ) {}

  @Post()
  @Roles('ADMIN')
  async assign(
    @Param('projectId') projectId: string,
    @Body('professorId') professorId: string,
  ): Promise<ProjectAcademicTutor> {
    return this.assignUseCase.execute({ projectId, professorId });
  }

  @Get()
  async list(
    @Param('projectId') projectId: string,
  ): Promise<ProjectAcademicTutor[]> {
    return this.listUseCase.execute(projectId);
  }

  @Delete(':professorId')
  @Roles('ADMIN')
  async remove(
    @Param('projectId') projectId: string,
    @Param('professorId') professorId: string,
  ): Promise<void> {
    return this.removeUseCase.execute(projectId, professorId);
  }
}
