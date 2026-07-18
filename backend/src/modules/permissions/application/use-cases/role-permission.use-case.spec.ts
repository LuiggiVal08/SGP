import { AssignPermissionToRoleUseCase } from './role-permission.use-case';
import { RemovePermissionFromRoleUseCase } from './role-permission.use-case';
import { ListRolePermissionsUseCase } from './role-permission.use-case';
import { AssignRoleToUserUseCase } from './user-role.use-case';
import { RemoveRoleFromUserUseCase } from './user-role.use-case';
import { ListUserRolesUseCase } from './user-role.use-case';
import { IRolePermissionRepository } from '../../domain/ports/IRolePermissionRepository';
import { IPermissionRepository } from '../../domain/ports/IPermissionRepository';
import { IUserRoleRepository } from '../../domain/ports/IUserRoleRepository';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';
import { Role } from '@modules/roles/domain/entities/Role';
import { Permission } from '../../domain/entities/Permission';

const roleRepoMock = (): jest.Mocked<IRoleRepository> => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
});

const permRepoMock = (): jest.Mocked<IPermissionRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('AssignPermissionToRoleUseCase', () => {
  it('assigns when role & permission exist', async () => {
    const rp: jest.Mocked<IRolePermissionRepository> = {
      assign: jest.fn(),
      remove: jest.fn(),
      findPermissionsByRoleId: jest.fn(),
      findByRoleId: jest.fn(),
    };
    const roleRepo = roleRepoMock();
    const permRepo = permRepoMock();
    roleRepo.findById.mockResolvedValue(new Role('r1', 'ADMIN', ''));
    permRepo.findById.mockResolvedValue(new Permission('p1', 'a', null));
    const uc = new AssignPermissionToRoleUseCase(rp, roleRepo, permRepo);
    const r = await uc.execute('r1', 'p1');
    expect(r).toEqual({ roleId: 'r1', permissionId: 'p1' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(rp.assign).toHaveBeenCalledWith('r1', 'p1');
  });

  it('throws when role missing', async () => {
    const rp: jest.Mocked<IRolePermissionRepository> = {
      assign: jest.fn(),
      remove: jest.fn(),
      findPermissionsByRoleId: jest.fn(),
      findByRoleId: jest.fn(),
    };
    const roleRepo = roleRepoMock();
    const permRepo = permRepoMock();
    roleRepo.findById.mockResolvedValue(null);
    const uc = new AssignPermissionToRoleUseCase(rp, roleRepo, permRepo);
    await expect(uc.execute('r1', 'p1')).rejects.toThrow();
  });
});

describe('RemovePermissionFromRoleUseCase', () => {
  it('removes', async () => {
    const rp: jest.Mocked<IRolePermissionRepository> = {
      assign: jest.fn(),
      remove: jest.fn(),
      findPermissionsByRoleId: jest.fn(),
      findByRoleId: jest.fn(),
    };
    const uc = new RemovePermissionFromRoleUseCase(rp);
    await uc.execute('r1', 'p1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(rp.remove).toHaveBeenCalledWith('r1', 'p1');
  });
});

describe('ListRolePermissionsUseCase', () => {
  it('lists', async () => {
    const rp: jest.Mocked<IRolePermissionRepository> = {
      assign: jest.fn(),
      remove: jest.fn(),
      findPermissionsByRoleId: jest
        .fn()
        .mockResolvedValue([new Permission('p1', 'a', null)]),
      findByRoleId: jest.fn(),
    };
    const uc = new ListRolePermissionsUseCase(rp);
    const r = await uc.execute('r1');
    expect(r).toHaveLength(1);
  });
});

describe('AssignRoleToUserUseCase', () => {
  it('assigns when role exists', async () => {
    const ur: jest.Mocked<IUserRoleRepository> = {
      assign: jest.fn(),
      remove: jest.fn(),
      findRoleIdsByUserId: jest.fn(),
    };
    const roleRepo = roleRepoMock();
    roleRepo.findById.mockResolvedValue(new Role('r1', 'ADMIN', ''));
    const uc = new AssignRoleToUserUseCase(ur, roleRepo);
    const r = await uc.execute('u1', 'r1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ur.assign).toHaveBeenCalledWith('u1', 'r1');
    expect(r).toEqual({ userId: 'u1', roleId: 'r1' });
  });

  it('throws when role missing', async () => {
    const ur: jest.Mocked<IUserRoleRepository> = {
      assign: jest.fn(),
      remove: jest.fn(),
      findRoleIdsByUserId: jest.fn(),
    };
    const roleRepo = roleRepoMock();
    roleRepo.findById.mockResolvedValue(null);
    const uc = new AssignRoleToUserUseCase(ur, roleRepo);
    await expect(uc.execute('u1', 'r1')).rejects.toThrow();
  });
});

describe('RemoveRoleFromUserUseCase', () => {
  it('removes', async () => {
    const ur: jest.Mocked<IUserRoleRepository> = {
      assign: jest.fn(),
      remove: jest.fn(),
      findRoleIdsByUserId: jest.fn(),
    };
    const uc = new RemoveRoleFromUserUseCase(ur);
    await uc.execute('u1', 'r1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ur.remove).toHaveBeenCalledWith('u1', 'r1');
  });
});

describe('ListUserRolesUseCase', () => {
  it('lists', async () => {
    const ur: jest.Mocked<IUserRoleRepository> = {
      assign: jest.fn(),
      remove: jest.fn(),
      findRoleIdsByUserId: jest.fn().mockResolvedValue(['r1', 'r2']),
    };
    const uc = new ListUserRolesUseCase(ur);
    const r = await uc.execute('u1');
    expect(r).toEqual(['r1', 'r2']);
  });
});
