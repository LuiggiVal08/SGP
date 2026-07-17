import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { Roles } from '../../../../auth/infrastructure/http/guards/roles.decorator';
import { RolesGuard } from '../../../../auth/infrastructure/http/guards/roles.guard';
import { LogActivity } from '../../../../activity-log/infrastructure/http/log-activity.decorator';
import { GenerateCompletionCertificateUseCase } from '../../../application/use-cases/generate-completion-certificate.use-case';
import { GetCompletionCertificatesUseCase } from '../../../application/use-cases/get-completion-certificates.use-case';
import { GetByAuthorUseCase } from '../../../application/use-cases/get-by-author.use-case';
import { GetByIdUseCase } from '../../../application/use-cases/get-by-id.use-case';
import { PaginationDto } from '@share/application/dtos/pagination.dto';

@ApiTags('Completion Certificates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CompletionCertificateController {
  constructor(
    private readonly generateUseCase: GenerateCompletionCertificateUseCase,
    private readonly getCertificatesUseCase: GetCompletionCertificatesUseCase,
    private readonly getByAuthorUseCase: GetByAuthorUseCase,
    private readonly getByIdUseCase: GetByIdUseCase,
  ) {}

  @Post('project-authors/:authorId/completion-certificate')
  @Roles('ADMIN')
  @LogActivity('CREATE', 'COMPLETION_CERTIFICATE')
  @ApiOperation({
    summary: 'Generar certificado de culminación para un autor de proyecto',
  })
  async generate(@Param('authorId') authorId: string) {
    return this.generateUseCase.execute(authorId);
  }

  @Get('completion-certificates')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar certificados de culminación' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const dto: PaginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search || undefined,
    };
    return this.getCertificatesUseCase.execute(dto);
  }

  @Get('completion-certificates/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener certificado de culminación por id' })
  async findById(@Param('id') id: string) {
    return this.getByIdUseCase.execute(id);
  }
}
