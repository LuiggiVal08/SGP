import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';

export interface MeResponse {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  pnfId: string;
  institutionId: string;
  phone?: string;
}

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(userId: string): Promise<MeResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findById(user.roleId);
    return {
      id: user.id,
      dni: user.dni,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: role?.name ?? '',
      isActive: user.isActive,
      pnfId: user.pnfId,
      institutionId: user.institutionId,
      phone: user.phone,
    };
  }
}
