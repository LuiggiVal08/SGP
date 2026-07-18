import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import {
  ILoginUseCase,
  LoginInput,
  LoginOutput,
} from '../../domain/ports/ILoginUseCase';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IHashService } from '../../domain/ports/IHashService';
import { ITokenService, TokenPayload } from '../../domain/ports/ITokenService';
import { IRoleRepository } from '../../../roles/domain/ports/IRoleRepository';
import { IUserSessionRepository } from '../../domain/ports/IUserSessionRepository';

@Injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IUserSessionRepository')
    private readonly userSessionRepository: IUserSessionRepository,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const identifier = input.identifier ?? input.email;
    if (!identifier) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = identifier.includes('@')
      ? await this.userRepository.findByEmail(identifier)
      : await this.userRepository.findByDni(identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashService.compare(
      input.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const role = await this.roleRepository.findById(user.roleId);
    const roleName = role?.name ?? 'STUDENT';

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: roleName,
    };

    const accessToken = this.tokenService.generate(payload);
    const refreshToken = this.tokenService.generateRefresh(payload);

    await this.userSessionRepository.create({
      userId: user.id,
      device: input.device ?? null,
      ip: input.ip ?? null,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: roleName,
      },
    };
  }
}
