import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';

export interface UserWithRole {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  careerId: string;
  institutionId: string;
  roleId: string;
  roleName: string;
}

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(role?: string): Promise<UserWithRole[]> {
    const users = !role
      ? await this.userRepository.findAll()
      : await this.userRepository.findByRoleId(
          (await this.roleRepository.findByName(role))?.id ?? '',
        );

    const roles = await this.roleRepository.findAll();
    const roleMap = new Map(roles.map((r) => [r.id, r.name]));

    return users.map((u) => ({
      id: u.id,
      dni: u.dni,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      isActive: u.isActive,
      careerId: u.careerId,
      institutionId: u.institutionId,
      roleId: u.roleId,
      roleName: roleMap.get(u.roleId) ?? '',
    }));
  }
}
