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
import { RolesGuard } from '../../../../auth/infrastructure/http/guards/roles.guard';
import { Roles } from '../../../../auth/infrastructure/http/guards/roles.decorator';
import {
  AssignPermissionToRoleUseCase,
  RemovePermissionFromRoleUseCase,
  ListRolePermissionsUseCase,
} from '../../../application/use-cases/role-permission.use-case';
import { AssignPermissionDto } from '../dto/permission.dto';

@ApiTags('Role Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('roles')
export class RolePermissionController {
  constructor(
    private readonly assignUseCase: AssignPermissionToRoleUseCase,
    private readonly removeUseCase: RemovePermissionFromRoleUseCase,
    private readonly listUseCase: ListRolePermissionsUseCase,
  ) {}

  @Post(':roleId/permissions')
  @ApiOperation({ summary: 'Asignar permiso a rol' })
  assign(@Param('roleId') roleId: string, @Body() dto: AssignPermissionDto) {
    return this.assignUseCase.execute(roleId, dto.permissionId);
  }

  @Delete(':roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Remover permiso de rol' })
  remove(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.removeUseCase.execute(roleId, permissionId);
  }

  @Get(':roleId/permissions')
  @ApiOperation({ summary: 'Listar permisos de rol' })
  list(@Param('roleId') roleId: string) {
    return this.listUseCase.execute(roleId);
  }
}
