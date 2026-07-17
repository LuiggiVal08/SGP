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
import { LogActivity } from '../../../../activity-log/infrastructure/http/log-activity.decorator';
import { GetAllTagsUseCase } from '../../../application/use-cases/get-all-tags.use-case';
import { CreateTagUseCase } from '../../../application/use-cases/create-tag.use-case';
import { UpdateTagUseCase } from '../../../application/use-cases/update-tag.use-case';
import { DeleteTagUseCase } from '../../../application/use-cases/delete-tag.use-case';
import { CreateTagDto } from '../dtos/create-tag.dto';
import { UpdateTagDto } from '../dtos/update-tag.dto';
import { PaginationDto } from '@share/application/dtos/pagination.dto';

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagController {
  constructor(
    private readonly getAllTagsUseCase: GetAllTagsUseCase,
    private readonly createTagUseCase: CreateTagUseCase,
    private readonly updateTagUseCase: UpdateTagUseCase,
    private readonly deleteTagUseCase: DeleteTagUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar etiquetas' })
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
    return this.getAllTagsUseCase.execute(dto);
  }

  @Post()
  @LogActivity('CREATE', 'TAG')
  @ApiOperation({
    summary: 'Crear etiqueta',
    description:
      'Creación libre: cualquier usuario autenticado puede crear etiquetas',
  })
  async create(@Body() dto: CreateTagDto) {
    return this.createTagUseCase.execute(dto);
  }

  @Patch(':id')
  @LogActivity('UPDATE', 'TAG')
  @ApiOperation({
    summary: 'Actualizar etiqueta',
    description: 'Edición libre por ahora (P1 del SRS)',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.updateTagUseCase.execute(id, dto);
  }

  @Delete(':id')
  @LogActivity('DELETE', 'TAG')
  @ApiOperation({ summary: 'Eliminar etiqueta' })
  async delete(@Param('id') id: string) {
    return this.deleteTagUseCase.execute(id);
  }
}
