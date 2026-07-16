import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { LogActivity } from '../../../../activity-log/infrastructure/http/log-activity.decorator';
import { GetProjectTagsUseCase } from '../../../application/use-cases/get-project-tags.use-case';
import { AssignTagUseCase } from '../../../application/use-cases/assign-tag.use-case';
import { RemoveTagUseCase } from '../../../application/use-cases/remove-tag.use-case';
import { AssignTagDto } from '../dtos/assign-tag.dto';

@ApiTags('Project Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tags')
export class ProjectTagController {
  constructor(
    private readonly getProjectTagsUseCase: GetProjectTagsUseCase,
    private readonly assignTagUseCase: AssignTagUseCase,
    private readonly removeTagUseCase: RemoveTagUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar etiquetas de un proyecto' })
  async findByProject(@Param('projectId') projectId: string) {
    return this.getProjectTagsUseCase.execute(projectId);
  }

  @Post()
  @LogActivity('CREATE', 'PROJECT_TAG')
  @ApiOperation({ summary: 'Asignar etiqueta a un proyecto' })
  async assign(
    @Param('projectId') projectId: string,
    @Body() dto: AssignTagDto,
  ) {
    await this.assignTagUseCase.execute(projectId, dto.tagId);
    return this.getProjectTagsUseCase.execute(projectId);
  }

  @Delete(':tagId')
  @LogActivity('DELETE', 'PROJECT_TAG')
  @ApiOperation({ summary: 'Quitar etiqueta de un proyecto' })
  async remove(
    @Param('projectId') projectId: string,
    @Param('tagId') tagId: string,
  ) {
    await this.removeTagUseCase.execute(projectId, tagId);
    return { projectId, tagId, removed: true };
  }
}
