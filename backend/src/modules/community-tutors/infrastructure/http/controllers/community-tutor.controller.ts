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
import { GetAllCommunityTutorsUseCase } from '../../../application/use-cases/get-all-community-tutors.use-case';
import { CreateCommunityTutorUseCase } from '../../../application/use-cases/create-community-tutor.use-case';
import { UpdateCommunityTutorUseCase } from '../../../application/use-cases/update-community-tutor.use-case';
import { DeleteCommunityTutorUseCase } from '../../../application/use-cases/delete-community-tutor.use-case';
import { CreateCommunityTutorDto } from '../dtos/create-community-tutor.dto';
import { UpdateCommunityTutorDto } from '../dtos/update-community-tutor.dto';
import { PaginationDto } from '@share/application/dtos/pagination.dto';

@ApiTags('Community Tutors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('community-tutors')
export class CommunityTutorController {
  constructor(
    private readonly getAllCommunityTutorsUseCase: GetAllCommunityTutorsUseCase,
    private readonly createCommunityTutorUseCase: CreateCommunityTutorUseCase,
    private readonly updateCommunityTutorUseCase: UpdateCommunityTutorUseCase,
    private readonly deleteCommunityTutorUseCase: DeleteCommunityTutorUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar tutores comunitarios' })
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
    return this.getAllCommunityTutorsUseCase.execute(dto);
  }

  @Post()
  @Roles('ADMIN')
  @LogActivity('CREATE', 'COMMUNITY_TUTOR')
  @ApiOperation({ summary: 'Crear tutor comunitario' })
  async create(@Body() dto: CreateCommunityTutorDto) {
    return this.createCommunityTutorUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @LogActivity('UPDATE', 'COMMUNITY_TUTOR')
  @ApiOperation({ summary: 'Actualizar tutor comunitario' })
  async update(@Param('id') id: string, @Body() dto: UpdateCommunityTutorDto) {
    return this.updateCommunityTutorUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @LogActivity('DELETE', 'COMMUNITY_TUTOR')
  @ApiOperation({ summary: 'Eliminar tutor comunitario' })
  async delete(@Param('id') id: string) {
    return this.deleteCommunityTutorUseCase.execute(id);
  }
}
