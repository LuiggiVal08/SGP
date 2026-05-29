import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import {
  ILoginUseCase,
  LoginInput,
  LoginOutput,
} from '../../domain/ports/ILoginUseCase';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IHashService } from '../../domain/ports/IHashService';
import { ITokenService } from '../../domain/ports/ITokenService';
import { IRoleRepository } from '../../../roles/domain/ports/IRoleRepository';

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
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);
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

    const accessToken = this.tokenService.generate({
      sub: user.id,
      email: user.email,
      role: roleName,
    });

    return {
      accessToken,
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
