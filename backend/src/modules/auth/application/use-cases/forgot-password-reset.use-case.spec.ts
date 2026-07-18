import { ForgotPasswordResetUseCase } from './forgot-password-reset.use-case';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IHashService } from '../../domain/ports/IHashService';
import { IUserTokenRepository } from '../../domain/ports/IUserTokenRepository';
import { UserToken } from '../../domain/entities/UserToken';

describe('ForgotPasswordResetUseCase', () => {
  let useCase: ForgotPasswordResetUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashService: jest.Mocked<IHashService>;
  let userTokenRepository: jest.Mocked<IUserTokenRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;
    hashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    userTokenRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markUsed: jest.fn(),
    };

    useCase = new ForgotPasswordResetUseCase(
      userRepository,
      hashService,
      userTokenRepository,
    );
  });

  const buildToken = (overrides: Partial<any> = {}) =>
    new UserToken(
      overrides.id ?? 'token-uuid',
      overrides.userId ?? 'user-uuid',
      overrides.token ?? 'rawtoken',
      overrides.type ?? 'PASSWORD_RESET',
      overrides.used ?? false,
      overrides.expiration ?? new Date(Date.now() + 15 * 60 * 1000),
      overrides.createdAt ?? new Date(),
    );

  it('hashes the new password, updates the user and marks the token used', async () => {
    userTokenRepository.findByToken.mockResolvedValue(buildToken());
    hashService.hash.mockResolvedValue('new-hash');

    await useCase.execute({ resetToken: 'rawtoken', newPassword: 'newPass1' });

    expect(hashService.hash).toHaveBeenCalledWith('newPass1');
    expect(userRepository.update).toHaveBeenCalledWith('user-uuid', {
      password: 'new-hash',
    });
    expect(userTokenRepository.markUsed).toHaveBeenCalledWith('token-uuid');
  });

  it('throws UnauthorizedException when token is not found', async () => {
    userTokenRepository.findByToken.mockResolvedValue(null);

    await expect(
      useCase.execute({ resetToken: 'missing', newPassword: 'newPass1' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when token type is wrong', async () => {
    userTokenRepository.findByToken.mockResolvedValue(
      buildToken({ type: 'EMAIL_VERIFY' }),
    );

    await expect(
      useCase.execute({ resetToken: 'rawtoken', newPassword: 'newPass1' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws BadRequestException when token was already used', async () => {
    userTokenRepository.findByToken.mockResolvedValue(
      buildToken({ used: true }),
    );

    await expect(
      useCase.execute({ resetToken: 'rawtoken', newPassword: 'newPass1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when token is expired', async () => {
    userTokenRepository.findByToken.mockResolvedValue(
      buildToken({ expiration: new Date(Date.now() - 1000) }),
    );

    await expect(
      useCase.execute({ resetToken: 'rawtoken', newPassword: 'newPass1' }),
    ).rejects.toThrow(BadRequestException);
  });
});
