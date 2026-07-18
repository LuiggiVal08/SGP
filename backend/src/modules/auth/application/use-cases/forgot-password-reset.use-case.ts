import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IHashService } from '../../domain/ports/IHashService';
import { IUserTokenRepository } from '../../domain/ports/IUserTokenRepository';

export interface ForgotPasswordResetInput {
  resetToken: string;
  newPassword: string;
}

@Injectable()
export class ForgotPasswordResetUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
    @Inject('IUserTokenRepository')
    private readonly userTokenRepository: IUserTokenRepository,
  ) {}

  async execute(input: ForgotPasswordResetInput): Promise<void> {
    const record = await this.userTokenRepository.findByToken(input.resetToken);
    if (!record) {
      throw new UnauthorizedException('Token de restablecimiento inválido');
    }

    if (record.type !== 'PASSWORD_RESET') {
      throw new UnauthorizedException('Token inválido');
    }

    if (record.used) {
      throw new BadRequestException('Este token ya fue utilizado');
    }

    if (record.expiration && record.expiration.getTime() < Date.now()) {
      throw new BadRequestException('El token ha expirado');
    }

    const newPasswordHash = await this.hashService.hash(input.newPassword);
    await this.userRepository.update(record.userId, {
      password: newPasswordHash,
    });

    await this.userTokenRepository.markUsed(record.id);
  }
}
