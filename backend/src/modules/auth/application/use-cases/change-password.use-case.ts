import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IHashService } from '../../domain/ports/IHashService';

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isCurrentPasswordValid = await this.hashService.compare(
      input.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const newPasswordHash = await this.hashService.hash(input.newPassword);
    await this.userRepository.update(input.userId, {
      password: newPasswordHash,
    });
  }
}
