import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IRolePermissionRepository } from '../../domain/ports/IRolePermissionRepository';
import { IPermissionRepository } from '../../domain/ports/IPermissionRepository';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';

@Injectable()
export class AssignPermissionToRoleUseCase {
  constructor(
    @Inject('IRolePermissionRepository')
    private readonly rolePermissionRepository: IRolePermissionRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(roleId: string, permissionId: string) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundException('ROLE_NOT_FOUND');
    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission) throw new NotFoundException('PERMISSION_NOT_FOUND');
    await this.rolePermissionRepository.assign(roleId, permissionId);
    return { roleId, permissionId };
  }
}

@Injectable()
export class RemovePermissionFromRoleUseCase {
  constructor(
    @Inject('IRolePermissionRepository')
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  async execute(roleId: string, permissionId: string) {
    await this.rolePermissionRepository.remove(roleId, permissionId);
    return { roleId, permissionId };
  }
}

@Injectable()
export class ListRolePermissionsUseCase {
  constructor(
    @Inject('IRolePermissionRepository')
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  async execute(roleId: string) {
    return this.rolePermissionRepository.findPermissionsByRoleId(roleId);
  }
}
