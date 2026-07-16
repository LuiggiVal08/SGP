import { Injectable, Inject } from '@nestjs/common';
import { ILogoutUseCase } from '../../domain/ports/ILogoutUseCase';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { env } from '@config/env.config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ms = require('ms');

@Injectable()
export class LogoutUseCase implements ILogoutUseCase {
  constructor(
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(refreshToken: string): Promise<{ message: string }> {
    const ttlSeconds = Math.floor(
      Number(ms(env.JWT_REFRESH_EXPIRES_IN as any)) / 1000,
    );
    await this.cacheService.set(
      `blacklist:refresh:${refreshToken}`,
      '1',
      ttlSeconds,
    );
    return { message: 'Sesión cerrada exitosamente' };
  }
}
