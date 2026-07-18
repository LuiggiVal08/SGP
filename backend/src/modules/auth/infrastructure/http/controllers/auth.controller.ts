import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Inject,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { ILoginUseCase } from '../../../domain/ports/ILoginUseCase';
import { IRefreshTokenUseCase } from '../../../domain/ports/IRefreshTokenUseCase';
import { ILogoutUseCase } from '../../../domain/ports/ILogoutUseCase';
import { ListUserSessionsUseCase } from '../../../application/use-cases/session-use-cases';
import {
  CloseUserSessionUseCase,
  CloseAllUserSessionsUseCase,
} from '../../../application/use-cases/session-use-cases';
import { VerifyEmailUseCase } from '../../../application/use-cases/verify-email.use-case';
import { LoginDto } from '../dtos/login.dto';
import { RefreshDto } from '../dtos/refresh.dto';
import { JwtAuthGuard } from '@modules/auth/infrastructure/http/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: { sub: string; email: string; role: string };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('ILoginUseCase')
    private readonly loginUseCase: ILoginUseCase,
    @Inject('IRefreshTokenUseCase')
    private readonly refreshTokenUseCase: IRefreshTokenUseCase,
    @Inject('ILogoutUseCase')
    private readonly logoutUseCase: ILogoutUseCase,
    @Inject('IListUserSessionsUseCase')
    private readonly listUserSessionsUseCase: ListUserSessionsUseCase,
    @Inject('ICloseUserSessionUseCase')
    private readonly closeUserSessionUseCase: CloseUserSessionUseCase,
    @Inject('ICloseAllUserSessionsUseCase')
    private readonly closeAllUserSessionsUseCase: CloseAllUserSessionsUseCase,
    @Inject('IVerifyEmailUseCase')
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión (email o DNI)' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const identifier = dto.identifier ?? dto.email;
    if (!identifier) {
      throw new BadRequestException('identifier or email is required');
    }
    const userAgent = req.headers['user-agent'];
    return this.loginUseCase.execute({
      identifier,
      password: dto.password,
      device: userAgent ? userAgent.slice(0, 100) : null,
      ip: req.ip ?? null,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens con un refresh token' })
  async refresh(@Body() dto: RefreshDto) {
    return this.refreshTokenUseCase.execute({ refreshToken: dto.refreshToken });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión (revoca refresh + sesiones)' })
  async logout(@Body() dto: RefreshDto) {
    return this.logoutUseCase.execute(dto.refreshToken);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verificar email con token enviado por correo' })
  async verifyEmail(@Query('token') token: string) {
    return this.verifyEmailUseCase.execute(token);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar sesiones activas del usuario' })
  async listSessions(@Req() req: RequestWithUser) {
    return this.listUserSessionsUseCase.execute(req.user.sub);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar una sesión activa del usuario' })
  async closeSession(
    @Req() req: RequestWithUser,
    @Param('id') sessionId: string,
  ) {
    return this.closeUserSessionUseCase.execute(req.user.sub, sessionId);
  }

  @Delete('sessions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar todas las sesiones activas del usuario' })
  async closeAllSessions(@Req() req: RequestWithUser) {
    return this.closeAllUserSessionsUseCase.execute(req.user.sub);
  }
}
