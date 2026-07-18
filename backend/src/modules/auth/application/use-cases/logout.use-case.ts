import { Injectable, Inject } from '@nestjs/common';
import { ILogoutUseCase } from '../../domain/ports/ILogoutUseCase';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { ITokenService } from '../../domain/ports/ITokenService';
import { IUserSessionRepository } from '../../domain/ports/IUserSessionRepository';
import { env } from '@config/env.config';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const ms = require('ms');

@Injectable()
export class LogoutUseCase implements ILogoutUseCase {
  constructor(
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
    @Inject('IUserSessionRepository')
    private readonly userSessionRepository: IUserSessionRepository,
  ) {}

  async execute(refreshToken: string): Promise<{ message: string }> {
    const ttlSeconds = Math.floor(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      Number(ms(env.JWT_REFRESH_EXPIRES_IN as any)) / 1000,
    );
    await this.cacheService.set(
      `blacklist:refresh:${refreshToken}`,
      '1',
      ttlSeconds,
    );

    try {
      const payload = this.tokenService.verifyRefresh(refreshToken);
      const sessions = await this.userSessionRepository.findActiveByUserId(
        payload.sub,
      );
      await Promise.all(
        sessions.map((session) =>
          this.userSessionRepository.deactivate(session.id),
        ),
      );
    } catch {
      // Token invalid/expired: blacklist already applied, nothing to deactivate.
    }

    return { message: 'Sesión cerrada exitosamente' };
  }
}
