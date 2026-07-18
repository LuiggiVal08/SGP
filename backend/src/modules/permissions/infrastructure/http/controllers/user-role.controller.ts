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
  AssignRoleToUserUseCase,
  RemoveRoleFromUserUseCase,
  ListUserRolesUseCase,
} from '../../../application/use-cases/user-role.use-case';
import { AssignRoleDto } from '../dto/permission.dto';

@ApiTags('User Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('users')
export class UserRoleController {
  constructor(
    private readonly assignUseCase: AssignRoleToUserUseCase,
    private readonly removeUseCase: RemoveRoleFromUserUseCase,
    private readonly listUseCase: ListUserRolesUseCase,
  ) {}

  @Post(':userId/roles')
  @ApiOperation({ summary: 'Asignar rol a usuario' })
  assign(@Param('userId') userId: string, @Body() dto: AssignRoleDto) {
    return this.assignUseCase.execute(userId, dto.roleId);
  }

  @Delete(':userId/roles/:roleId')
  @ApiOperation({ summary: 'Remover rol de usuario' })
  remove(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.removeUseCase.execute(userId, roleId);
  }

  @Get(':userId/roles')
  @ApiOperation({ summary: 'Listar roles de usuario' })
  list(@Param('userId') userId: string) {
    return this.listUseCase.execute(userId);
  }
}
