import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { GetAllRolesUseCase } from '../../../application/use-cases/get-all-roles.use-case';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly getAllRolesUseCase: GetAllRolesUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Listar roles',
    description: 'Obtiene todos los roles del sistema',
  })
  async findAll(): Promise<any> {
    return this.getAllRolesUseCase.execute();
  }
}
