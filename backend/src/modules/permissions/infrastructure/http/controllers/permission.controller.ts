import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../auth/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../auth/infrastructure/http/guards/roles.decorator';
import {
  CreatePermissionUseCase,
  UpdatePermissionUseCase,
  DeletePermissionUseCase,
  GetPermissionUseCase,
  ListPermissionsUseCase,
} from '../../../application/use-cases/permission-crud.use-case';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../dto/permission.dto';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('permissions')
export class PermissionController {
  constructor(
    private readonly createUseCase: CreatePermissionUseCase,
    private readonly updateUseCase: UpdatePermissionUseCase,
    private readonly deleteUseCase: DeletePermissionUseCase,
    private readonly getUseCase: GetPermissionUseCase,
    private readonly listUseCase: ListPermissionsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar permisos' })
  findAll() {
    return this.listUseCase.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Crear permiso' })
  create(@Body() dto: CreatePermissionDto) {
    return this.createUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener permiso' })
  findOne(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar permiso' })
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar permiso' })
  remove(@Param('id') id: string) {
    return this.deleteUseCase.execute(id);
  }
}
