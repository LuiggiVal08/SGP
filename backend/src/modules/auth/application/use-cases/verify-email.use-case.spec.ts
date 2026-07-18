import { VerifyEmailUseCase } from './verify-email.use-case';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IUserTokenRepository } from '../../domain/ports/IUserTokenRepository';
import { IUserRepository } from '@modules/users/domain/ports/IUserRepository';
import { UserToken } from '../../domain/entities/UserToken';
import { User } from '@modules/users/domain/entities/User';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;
  let userTokenRepository: jest.Mocked<IUserTokenRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  const makeToken = (overrides: Partial<UserToken> = {}): UserToken =>
    new UserToken(
      overrides.id ?? 'token-1',
      overrides.userId ?? 'uuid-1',
      overrides.token ?? 'valid-token',
      overrides.type ?? 'EMAIL_VERIFY',
      overrides.used ?? false,
      overrides.expiration ?? new Date(Date.now() + 60_000),
      overrides.createdAt ?? new Date(),
    );

  const makeUser = () =>
    new User(
      'uuid-1',
      '12345678',
      'Jane',
      'Doe',
      'jane@test.com',
      'hashed',
      true,
      'pnf-1',
      'inst-1',
      'role-1',
    );

  beforeEach(() => {
    userTokenRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markUsed: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByDni: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findByRoleId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      countByInstitutionId: jest.fn(),
      countByPnfId: jest.fn(),
      countByRoleName: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new VerifyEmailUseCase(userTokenRepository, userRepository);
  });

  it('should throw BadRequest when token is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userTokenRepository.findByToken).not.toHaveBeenCalled();
  });

  it('should throw NotFound when token does not exist', async () => {
    userTokenRepository.findByToken.mockResolvedValue(null);
    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequest when token type is not EMAIL_VERIFY', async () => {
    userTokenRepository.findByToken.mockResolvedValue(
      makeToken({ type: 'PASSWORD_RESET' }),
    );
    await expect(useCase.execute('valid-token')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequest when token was already used', async () => {
    userTokenRepository.findByToken.mockResolvedValue(
      makeToken({ used: true }),
    );
    await expect(useCase.execute('valid-token')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequest when token is expired', async () => {
    userTokenRepository.findByToken.mockResolvedValue(
      makeToken({ expiration: new Date(Date.now() - 60_000) }),
    );
    await expect(useCase.execute('valid-token')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFound when user does not exist', async () => {
    userTokenRepository.findByToken.mockResolvedValue(makeToken());
    userRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('valid-token')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should mark token used and return verified email', async () => {
    userTokenRepository.findByToken.mockResolvedValue(makeToken());
    userRepository.findById.mockResolvedValue(makeUser());

    const result = await useCase.execute('valid-token');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userTokenRepository.markUsed).toHaveBeenCalledWith('token-1');
    expect(result).toEqual({ email: 'jane@test.com', verified: true });
  });
});
