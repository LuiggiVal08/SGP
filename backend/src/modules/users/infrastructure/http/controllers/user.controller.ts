import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { Roles } from '../../../../auth/infrastructure/http/guards/roles.decorator';
import { RolesGuard } from '../../../../auth/infrastructure/http/guards/roles.guard';
import { LogActivity } from '../../../../activity-log/infrastructure/http/log-activity.decorator';
import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case';
import { GetMeUseCase } from '../../../application/use-cases/get-me.use-case';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { ImportUsersCsvUseCase } from '../../../application/use-cases/import-users-csv.use-case';
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case';
import { ToggleUserActiveUseCase } from '../../../application/use-cases/toggle-user-active.use-case';
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.use-case';
import { AdminUpdateUserUseCase } from '../../../application/use-cases/admin-update-user.use-case';
import { CreateUserDto } from '../dtos/create-user.dto';
import { AdminUpdateUserDto } from '../dtos/admin-update-user.dto';
import { PaginationDto } from '@share/application/dtos/pagination.dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly importUsersCsvUseCase: ImportUsersCsvUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly toggleUserActiveUseCase: ToggleUserActiveUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly adminUpdateUserUseCase: AdminUpdateUserUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene todos los usuarios, opcionalmente filtrados por rol',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filtrar por nombre de rol',
  })
  async findAll(
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<any> {
    const dto: PaginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search || undefined,
    };
    return this.getUsersUseCase.execute(role, dto);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Mi perfil',
    description: 'Obtiene los datos del usuario autenticado',
  })
  async getMe(@Req() req: { user: JwtPayload }): Promise<any> {
    return this.getMeUseCase.execute(req.user.sub);
  }

  @Post()
  @Roles('ADMIN')
  @LogActivity('CREATE', 'USER')
  @ApiOperation({
    summary: 'Crear usuario',
    description: 'Registra un nuevo usuario en el sistema',
  })
  async create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Post('import-csv')
  @Roles('ADMIN')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Importar usuarios desde CSV',
    description:
      'Carga un CSV con estudiantes/profesores/coordinadores por institución/PNF. Columnas: dni, firstName, lastName, email, password, roleName (ALUMNO|DOCENTE|COORDINADOR), pnfId (opcional), institutionId (opcional).',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async importCsv(
    @UploadedFile() file: { buffer: Buffer; mimetype: string } | undefined,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required');
    }
    const csvContent = file.buffer.toString('utf-8');
    return this.importUsersCsvUseCase.execute(csvContent);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Actualizar mi perfil',
    description: 'Actualiza los datos del usuario autenticado',
  })
  async updateMe(
    @Req() req: { user: JwtPayload },
    @Body()
    dto: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    },
  ): Promise<void> {
    return this.updateUserUseCase.execute(req.user.sub, dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @LogActivity('UPDATE', 'USER')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza los datos de un usuario (solo admin)',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ): Promise<void> {
    return this.adminUpdateUserUseCase.execute(id, dto);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMIN')
  @LogActivity('TOGGLE_ACTIVE', 'USER')
  @ApiOperation({
    summary: 'Activar/Desactivar usuario',
    description: 'Cambia el estado activo/inactivo de un usuario (solo admin)',
  })
  async toggleActive(@Param('id') id: string): Promise<{ isActive: boolean }> {
    return this.toggleUserActiveUseCase.execute(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @LogActivity('DELETE', 'USER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Elimina permanentemente un usuario del sistema (solo admin)',
  })
  async delete(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    return this.deleteUserUseCase.execute(id, {
      sub: req.user.sub,
      role: req.user.role,
    });
  }
}
