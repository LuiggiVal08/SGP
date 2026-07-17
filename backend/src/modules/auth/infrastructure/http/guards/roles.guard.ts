import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Access denied');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!requiredRoles.includes(user.role)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (user.role === 'IRCOP' && requiredRoles.includes('ADMIN')) {
        return true;
      }
      throw new ForbiddenException(
        'Requires role: ' + requiredRoles.join(', '),
      );
    }
    return true;
  }
}
