import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { IUserRoleRepository } from '../../../domain/ports/IUserRoleRepository';
import { IRolePermissionRepository } from '../../../domain/ports/IRolePermissionRepository';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;
  let userRoleRepository: jest.Mocked<IUserRoleRepository>;
  let rolePermissionRepository: jest.Mocked<IRolePermissionRepository>;

  const ctxWithUser = (user: unknown) => {
    const getHandler = jest.fn();
    const getClass = jest.fn();
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler,
      getClass,
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    userRoleRepository = {
      assign: jest.fn(),
      remove: jest.fn(),
      findRoleIdsByUserId: jest.fn().mockResolvedValue(['r1']),
    };
    rolePermissionRepository = {
      assign: jest.fn(),
      remove: jest.fn(),
      findPermissionsByRoleId: jest
        .fn()
        .mockResolvedValue([{ name: 'user.read' }, { name: 'user.write' }]),
      findByRoleId: jest.fn(),
    };
    guard = new PermissionsGuard(
      reflector,
      userRoleRepository,
      rolePermissionRepository,
    );
  });

  it('allows when no permission required', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ok = await guard.canActivate(ctxWithUser({ sub: 'u1' }));
    expect(ok).toBe(true);
  });

  it('allows when user has required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue(['user.read']);
    const ok = await guard.canActivate(ctxWithUser({ sub: 'u1' }));
    expect(ok).toBe(true);
  });

  it('throws Forbidden when permission missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(['user.delete']);
    await expect(guard.canActivate(ctxWithUser({ sub: 'u1' }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws Forbidden when no user', async () => {
    reflector.getAllAndOverride.mockReturnValue(['user.read']);
    await expect(guard.canActivate(ctxWithUser(undefined))).rejects.toThrow(
      ForbiddenException,
    );
  });
});

void PERMISSIONS_KEY;
