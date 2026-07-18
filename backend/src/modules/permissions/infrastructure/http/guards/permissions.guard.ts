import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { IUserRoleRepository } from '../../../domain/ports/IUserRoleRepository';
import { IRolePermissionRepository } from '../../../domain/ports/IRolePermissionRepository';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,
    @Inject('IRolePermissionRepository')
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { user } = context.switchToHttp().getRequest();
    if (!user || typeof user !== 'object') {
      throw new ForbiddenException('Access denied');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = user.sub as string;
    const roleIds = await this.userRoleRepository.findRoleIdsByUserId(userId);

    const granted = new Set<string>();
    for (const roleId of roleIds) {
      const perms =
        await this.rolePermissionRepository.findPermissionsByRoleId(roleId);
      for (const p of perms) granted.add(p.name);
    }

    const missing = required.filter((r) => !granted.has(r));
    if (missing.length > 0) {
      throw new ForbiddenException(
        'Missing permissions: ' + missing.join(', '),
      );
    }
    return true;
  }
}
