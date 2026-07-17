import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IHashService } from '../../domain/ports/IHashService';

export interface ForgotPasswordResetInput {
  verificationToken: string;
  newPassword: string;
}

@Injectable()
export class ForgotPasswordResetUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: ForgotPasswordResetInput): Promise<void> {
    let payload: { sub: string; purpose: string };
    try {
      payload = this.jwtService.verify<{ sub: string; purpose: string }>(
        input.verificationToken,
      );
    } catch {
      throw new UnauthorizedException(
        'Token inválido o expirado. Inicie el proceso nuevamente.',
      );
    }

    if (payload.purpose !== 'password-reset-verify') {
      throw new UnauthorizedException('Token inválido');
    }

    const newPasswordHash = await this.hashService.hash(input.newPassword);
    await this.userRepository.update(payload.sub, {
      password: newPasswordHash,
    });
  }
}
