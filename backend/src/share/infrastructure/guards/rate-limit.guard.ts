import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { Request } from 'express';

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 300;

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip ?? 'unknown';
    const key = `rate-limit:login:${ip}`;

    const current = await this.cacheService.get(key);
    const attempts = current ? Number(current) : 0;

    if (attempts >= MAX_ATTEMPTS) {
      throw new HttpException(
        'Demasiados intentos. Intente nuevamente en 5 minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheService.set(key, String(attempts + 1), WINDOW_SECONDS);
    return true;
  }
}
