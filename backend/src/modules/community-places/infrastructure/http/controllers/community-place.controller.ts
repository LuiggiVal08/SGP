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
import { GetAllCommunityPlacesUseCase } from '../../../application/use-cases/get-all-community-places.use-case';
import { CreateCommunityPlaceUseCase } from '../../../application/use-cases/create-community-place.use-case';
import { UpdateCommunityPlaceUseCase } from '../../../application/use-cases/update-community-place.use-case';
import { DeleteCommunityPlaceUseCase } from '../../../application/use-cases/delete-community-place.use-case';
import { CreateCommunityPlaceDto } from '../dtos/create-community-place.dto';
import { UpdateCommunityPlaceDto } from '../dtos/update-community-place.dto';
import { PaginationDto } from '@share/application/dtos/pagination.dto';

@ApiTags('Community Places')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('community-places')
export class CommunityPlaceController {
  constructor(
    private readonly getAllCommunityPlacesUseCase: GetAllCommunityPlacesUseCase,
    private readonly createCommunityPlaceUseCase: CreateCommunityPlaceUseCase,
    private readonly updateCommunityPlaceUseCase: UpdateCommunityPlaceUseCase,
    private readonly deleteCommunityPlaceUseCase: DeleteCommunityPlaceUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar espacios comunitarios' })
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
    return this.getAllCommunityPlacesUseCase.execute(dto);
  }

  @Post()
  @Roles('ADMIN')
  @LogActivity('CREATE', 'COMMUNITY_PLACE')
  @ApiOperation({ summary: 'Crear espacio comunitario' })
  async create(@Body() dto: CreateCommunityPlaceDto) {
    return this.createCommunityPlaceUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @LogActivity('UPDATE', 'COMMUNITY_PLACE')
  @ApiOperation({ summary: 'Actualizar espacio comunitario' })
  async update(@Param('id') id: string, @Body() dto: UpdateCommunityPlaceDto) {
    return this.updateCommunityPlaceUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @LogActivity('DELETE', 'COMMUNITY_PLACE')
  @ApiOperation({ summary: 'Eliminar espacio comunitario' })
  async delete(@Param('id') id: string) {
    return this.deleteCommunityPlaceUseCase.execute(id);
  }
}
