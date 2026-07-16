import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/http/guards/roles.decorator';
import { CompletionCertificateService } from '../../application/services/completion-certificate.service';

@ApiTags('Completion Certificates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('completion-certificates')
export class CompletionCertificateController {
  constructor(
    private readonly certificateService: CompletionCertificateService,
  ) {}

  @Post('project-authors/:authorId')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate completion certificate',
    description:
      'Generates a completion certificate for a project author after defense approval',
  })
  @ApiParam({ name: 'authorId', description: 'User ID of the project author' })
  async generate(@Param('authorId') authorId: string) {
    return this.certificateService.generateByAuthorId(authorId);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'List all certificates',
    description: 'Lists all completion certificates (admin only)',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.certificateService.findAllPaginated({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search: search || undefined,
    });
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get certificate by ID',
    description: 'Retrieves a specific completion certificate',
  })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  async findOne(@Param('id') id: string) {
    return this.certificateService.findById(id);
  }
}
