import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { ILoginUseCase } from '../../../domain/ports/ILoginUseCase';
import { IRefreshTokenUseCase } from '../../../domain/ports/IRefreshTokenUseCase';
import { ILogoutUseCase } from '../../../domain/ports/ILogoutUseCase';
import { LoginDto } from '../dtos/login.dto';
import { RefreshDto } from '../dtos/refresh.dto';

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
}
