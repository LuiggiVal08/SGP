import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';
import type { PaginationDto } from '@share/application/dtos/pagination.dto';

export interface UserWithRole {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  pnfId: string;
  institutionId: string;
  roleId: string;
  roleName: string;
  phone?: string;
}

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(role?: string, dto?: PaginationDto): Promise<any> {
    if (
      dto &&
      (dto.page !== undefined ||
        dto.limit !== undefined ||
        dto.search !== undefined)
    ) {
      const roles = await this.roleRepository.findAll();
      const roleMap = new Map(roles.map((r) => [r.id, r.name]));

      const roleId = role ? roles.find((r) => r.name === role)?.id : undefined;

      const paginated = await this.userRepository.findAllPaginated(dto, roleId);
      return {
        data: paginated.data.map((u) => ({
          id: u.id,
          dni: u.dni,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          isActive: u.isActive,
          pnfId: u.pnfId,
          institutionId: u.institutionId,
          roleId: u.roleId,
          roleName: roleMap.get(u.roleId) ?? '',
          phone: u.phone,
        })),
        meta: paginated.meta,
      };
    }

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
      pnfId: u.pnfId,
      institutionId: u.institutionId,
      roleId: u.roleId,
      roleName: roleMap.get(u.roleId) ?? '',
      phone: u.phone,
    }));
  }
}
