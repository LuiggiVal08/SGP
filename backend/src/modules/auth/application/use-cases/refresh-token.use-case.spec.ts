import { RefreshTokenUseCase } from './refresh-token.use-case';
import { ITokenService } from '../../domain/ports/ITokenService';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IRoleRepository } from '../../../roles/domain/ports/IRoleRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { User } from '../../../users/domain/entities/User';
import { Role } from '../../../roles/domain/entities/Role';
import { UnauthorizedException } from '@nestjs/common';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let tokenService: jest.Mocked<ITokenService>;
  let userRepository: jest.Mocked<IUserRepository>;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let cacheService: jest.Mocked<ICacheService>;

  const mockUser = new User(
    'uuid-1',
    '12345678',
    'John',
    'Doe',
    'john@test.com',
    'hashed-pwd',
    true,
    'pnf-uuid',
    'inst-uuid',
    'role-uuid',
  );

  const mockRole = new Role('role-uuid', 'STUDENT', 'Student role');

  beforeEach(() => {
    tokenService = {
      generate: jest.fn(),
      verify: jest.fn(),
      generateRefresh: jest.fn(),
      verifyRefresh: jest.fn(),
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
    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };

    cacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new RefreshTokenUseCase(
      tokenService,
      userRepository,
      roleRepository,
      cacheService,
    );
  });

  it('should return new token pair on valid refresh token', async () => {
    tokenService.verifyRefresh.mockReturnValue({
      sub: 'uuid-1',
      email: 'john@test.com',
      role: 'STUDENT',
    });
    userRepository.findById.mockResolvedValue(mockUser);
    roleRepository.findById.mockResolvedValue(mockRole);
    tokenService.generate.mockReturnValue('new-access-token');
    tokenService.generateRefresh.mockReturnValue('new-refresh-token');

    const result = await useCase.execute({
      refreshToken: 'valid-refresh-token',
    });

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.user.email).toBe('john@test.com');
  });

  it('should throw UnauthorizedException when refresh token is invalid', async () => {
    tokenService.verifyRefresh.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(
      useCase.execute({ refreshToken: 'invalid-token' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when user not found', async () => {
    tokenService.verifyRefresh.mockReturnValue({
      sub: 'uuid-1',
      email: 'john@test.com',
      role: 'STUDENT',
    });
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ refreshToken: 'valid-token' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
