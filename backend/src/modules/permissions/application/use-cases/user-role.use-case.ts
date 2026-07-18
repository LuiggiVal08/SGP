import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRoleRepository } from '../../domain/ports/IUserRoleRepository';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';

@Injectable()
export class AssignRoleToUserUseCase {
  constructor(
    @Inject('IUserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(userId: string, roleId: string) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundException('ROLE_NOT_FOUND');
    await this.userRoleRepository.assign(userId, roleId);
    return { userId, roleId };
  }
}

@Injectable()
export class RemoveRoleFromUserUseCase {
  constructor(
    @Inject('IUserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async execute(userId: string, roleId: string) {
    await this.userRoleRepository.remove(userId, roleId);
    return { userId, roleId };
  }
}

@Injectable()
export class ListUserRolesUseCase {
  constructor(
    @Inject('IUserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async execute(userId: string) {
    return this.userRoleRepository.findRoleIdsByUserId(userId);
  }
}
