import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/IUserRepository';

@Injectable()
export class ToggleUserActiveUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<{ isActive: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isActive = !user.isActive;
    await this.userRepository.update(userId, { isActive });
    return { isActive };
  }
}
