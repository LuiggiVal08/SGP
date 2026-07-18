import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { IUserTokenRepository } from '../../domain/ports/IUserTokenRepository';
import { IUserRepository } from '@modules/users/domain/ports/IUserRepository';

export interface VerifyEmailResult {
  email: string;
  verified: boolean;
}

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject('IUserTokenRepository')
    private readonly userTokenRepository: IUserTokenRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(token: string): Promise<VerifyEmailResult> {
    if (!token || token.trim() === '') {
      throw new BadRequestException('El token es requerido');
    }

    const record = await this.userTokenRepository.findByToken(token);
    if (!record) {
      throw new NotFoundException('Token de verificación inválido');
    }

    if (record.type !== 'EMAIL_VERIFY') {
      throw new BadRequestException(
        'Tipo de token no válido para verificar email',
      );
    }

    if (record.used) {
      throw new BadRequestException('Este token ya fue utilizado');
    }

    if (record.expiration.getTime() < Date.now()) {
      throw new BadRequestException('El token de verificación ha expirado');
    }

    const user = await this.userRepository.findById(record.userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.userTokenRepository.markUsed(record.id);

    return { email: user.email, verified: true };
  }
}
