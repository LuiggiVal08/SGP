import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IRoleRepository } from '../../../roles/domain/ports/IRoleRepository';

export interface AdminUpdateUserInput {
  dni?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roleName?: string;
  pnfId?: string;
  institutionId?: string;
  phone?: string;
  isActive?: boolean;
}

@Injectable()
export class AdminUpdateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(userId: string, data: AdminUpdateUserInput): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: Record<string, any> = {};

    if (data.dni !== undefined) updateData.dni = data.dni;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.pnfId !== undefined) updateData.pnfId = data.pnfId;
    if (data.institutionId !== undefined)
      updateData.institutionId = data.institutionId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.roleName !== undefined) {
      const role = await this.roleRepository.findByName(data.roleName);
      if (!role) {
        throw new NotFoundException(`Role "${data.roleName}" not found`);
      }
      updateData.roleId = role.id;
    }

    await this.userRepository.update(userId, updateData);
  }
}
