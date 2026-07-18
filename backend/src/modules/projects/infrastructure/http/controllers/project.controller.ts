import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';
import { JwtAuthGuard } from '@modules/auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/infrastructure/http/guards/roles.guard';
import { Roles } from '@modules/auth/infrastructure/http/guards/roles.decorator';
import { CreateProjectUseCase } from '../../../application/use-cases/create-project.use-case';
import { UpdateProjectUseCase } from '../../../application/use-cases/update-project.use-case';
import { GetProjectByIdUseCase } from '../../../application/use-cases/get-project-by-id.use-case';
import { UploadProjectFilesUseCase } from '../../../application/use-cases/upload-project-files.use-case';
import { GetAllProjectsUseCase } from '../../../application/use-cases/get-all-projects.use-case';
import { ProjectScopeService } from '../../../application/services/project-scope.service';
import { GetDashboardStatsUseCase } from '../../../application/use-cases/get-dashboard-stats.use-case';
import { GetProjectFilesUseCase } from '../../../application/use-cases/get-project-files.use-case';
import { DeleteProjectFileUseCase } from '../../../application/use-cases/delete-project-file.use-case';
import { DeleteProjectUseCase } from '../../../application/use-cases/delete-project.use-case';
import { CreateMilestonesUseCase } from '../../../application/use-cases/create-milestones.use-case';
import { GetMilestonesUseCase } from '../../../application/use-cases/get-milestones.use-case';
import { UpdateMilestoneStatusUseCase } from '../../../application/use-cases/update-milestone-status.use-case';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import type { DocumentType } from '../../../domain/entities/ProjectFile';
import type { MilestoneStatus } from '../../../domain/entities/Project';
import { AddProjectAuthorUseCase } from '../../../application/use-cases/add-project-author.use-case';
import { ListProjectAuthorsUseCase } from '../../../application/use-cases/list-project-authors.use-case';
import { RemoveProjectAuthorUseCase } from '../../../application/use-cases/remove-project-author.use-case';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

const VALID_DOC_TYPES: DocumentType[] = ['RESUMEN', 'TOMO'];

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly getProjectByIdUseCase: GetProjectByIdUseCase,
    private readonly uploadProjectFilesUseCase: UploadProjectFilesUseCase,
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase,
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getProjectFilesUseCase: GetProjectFilesUseCase,
    private readonly deleteProjectFileUseCase: DeleteProjectFileUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly createMilestonesUseCase: CreateMilestonesUseCase,
    private readonly getMilestonesUseCase: GetMilestonesUseCase,
    private readonly updateMilestoneStatusUseCase: UpdateMilestoneStatusUseCase,
    private readonly addProjectAuthorUseCase: AddProjectAuthorUseCase,
    private readonly listProjectAuthorsUseCase: ListProjectAuthorsUseCase,
    private readonly removeProjectAuthorUseCase: RemoveProjectAuthorUseCase,
    private readonly projectScopeService: ProjectScopeService,
  ) {}

  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateProjectDto) {
    return this.createProjectUseCase.execute({
      title: dto.title,
      description: dto.description,
      problemStatement: dto.problemStatement,
      subjectAssignmentId: dto.subjectAssignmentId,
      locationId: dto.locationId,
      communityTutorId: dto.communityTutorId,
      cdSubmitted: dto.cdSubmitted,
      studentIds: dto.studentIds,
    });
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const user = req.user as { sub: string; role: string };
    if (page || limit || search) {
      return this.getAllProjectsUseCase.executePaginated({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
        user: { userId: user.sub, role: user.role },
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.getAllProjectsUseCase.execute({
      userId: user.sub,
      role: user.role,
    });
  }

  @Get('stats')
  async getStats() {
    return this.getDashboardStatsUseCase.execute();
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { sub: string; role: string };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const project = await this.getProjectByIdUseCase.execute(id);
    if (!project) throw new NotFoundException('Project not found');
    const scopeIds = await this.projectScopeService.resolveAllowedProjectIds({
      userId: user.sub,
      role: user.role,
    });
    if (scopeIds !== null && !scopeIds.includes(id)) {
      throw new ForbiddenException('No tiene acceso a este proyecto');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return project;
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.updateProjectUseCase.execute({ id, ...dto });
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteProjectUseCase.execute(id);
  }

  @Post(':id/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const projectId = req.params.id as string;
          const dest = join(process.cwd(), 'uploads', 'projects', projectId);
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: MulterFile,
    @Body('documentType') documentType: DocumentType,
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (!VALID_DOC_TYPES.includes(documentType)) {
      throw new BadRequestException(`Invalid document type: ${documentType}`);
    }

    return this.uploadProjectFilesUseCase.execute({
      projectId: id,
      documentType,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
  }

  @Get(':id/files')
  async getFiles(@Param('id') id: string) {
    return this.getProjectFilesUseCase.execute(id);
  }

  @Delete(':id/files/:fileId')
  async deleteFile(@Param('id') id: string, @Param('fileId') fileId: string) {
    return this.deleteProjectFileUseCase.execute(id, fileId);
  }

  @Post(':id/authors')
  async addAuthor(
    @Param('id') id: string,
    @Body() body: { studentId: string },
  ) {
    return this.addProjectAuthorUseCase.execute({
      projectId: id,
      studentId: body.studentId,
    });
  }

  @Get(':id/authors')
  async listAuthors(@Param('id') id: string) {
    return this.listProjectAuthorsUseCase.execute(id);
  }

  @Delete(':id/authors/:studentId')
  async removeAuthor(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ): Promise<void> {
    return this.removeProjectAuthorUseCase.execute(id, studentId);
  }

  @Post(':id/milestones')
  async createMilestones(@Param('id') id: string) {
    return this.createMilestonesUseCase.execute(id);
  }

  @Get(':id/milestones')
  async getMilestones(@Param('id') id: string) {
    return this.getMilestonesUseCase.execute(id);
  }

  @Patch(':id/milestones/:milestoneId/status')
  async updateMilestoneStatus(
    @Param('milestoneId') milestoneId: string,
    @Body('status') status: MilestoneStatus,
    @Body('userId') userId: string,
    @Body('comment') comment?: string,
  ) {
    return this.updateMilestoneStatusUseCase.execute(
      milestoneId,
      status,
      userId,
      comment,
    );
  }
}
