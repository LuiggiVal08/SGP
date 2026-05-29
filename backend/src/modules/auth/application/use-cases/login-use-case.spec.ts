import { LoginUseCase } from './login-use-case';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IHashService } from '../../domain/ports/IHashService';
import { ITokenService } from '../../domain/ports/ITokenService';
import { IRoleRepository } from '../../../roles/domain/ports/IRoleRepository';
import { User } from '../../../users/domain/entities/User';
import { Role } from '../../../roles/domain/entities/Role';
import { UnauthorizedException } from '@nestjs/common';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashService: jest.Mocked<IHashService>;
  let tokenService: jest.Mocked<ITokenService>;
  let roleRepository: jest.Mocked<IRoleRepository>;

  const mockUser = new User(
    'uuid-1',
    '12345678',
    'John',
    'Doe',
    'john@test.com',
    'hashed-pwd',
    true,
    'career-uuid',
    'inst-uuid',
    'role-uuid',
  );

  const mockRole = new Role('role-uuid', 'STUDENT', 'Student role');

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByDni: jest.fn(),
      findAll: jest.fn(),
      findByRoleId: jest.fn(),
      save: jest.fn(),
    };
    hashService = { hash: jest.fn(), compare: jest.fn() };
    tokenService = { generate: jest.fn(), verify: jest.fn() };
    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };

    useCase = new LoginUseCase(
      userRepository,
      hashService,
      tokenService,
      roleRepository,
    );
  });

  it('should return token and user on valid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hashService.compare.mockResolvedValue(true);
    roleRepository.findById.mockResolvedValue(mockRole);
    tokenService.generate.mockReturnValue('jwt-token');

    const result = await useCase.execute({
      email: 'john@test.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('jwt-token');
    expect(result.user.email).toBe('john@test.com');
    expect(result.user.role).toBe('STUDENT');
  });

  it('should throw UnauthorizedException when email not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'unknown@test.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'john@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
