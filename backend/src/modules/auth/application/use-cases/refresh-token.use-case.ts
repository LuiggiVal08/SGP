import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import {
  IRefreshTokenUseCase,
  RefreshTokenInput,
} from '../../domain/ports/IRefreshTokenUseCase';
import { ITokenService, TokenPayload } from '../../domain/ports/ITokenService';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IRoleRepository } from '../../../roles/domain/ports/IRoleRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';

@Injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(input: RefreshTokenInput) {
    // Check if token is blacklisted
    const isBlacklisted = await this.cacheService.get(
      `blacklist:refresh:${input.refreshToken}`,
    );
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    let payload: TokenPayload;
    try {
      payload = this.tokenService.verifyRefresh(input.refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const role = await this.roleRepository.findById(user.roleId);
    const roleName = role?.name ?? 'STUDENT';

    const newPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: roleName,
    };

    const accessToken = this.tokenService.generate(newPayload);
    const refreshToken = this.tokenService.generateRefresh(newPayload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        dni: user.dni,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: roleName,
        isActive: user.isActive,
        pnfId: user.pnfId,
        institutionId: user.institutionId,
        phone: user.phone,
      },
    };
  }
}
