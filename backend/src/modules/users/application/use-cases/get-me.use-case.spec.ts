import { GetMeUseCase } from './get-me.use-case';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';
import { User } from '../../domain/entities/User';
import { Role } from '@modules/roles/domain/entities/Role';
import { NotFoundException } from '@nestjs/common';

describe('GetMeUseCase', () => {
  let useCase: GetMeUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let roleRepository: jest.Mocked<IRoleRepository>;

  const user = new User(
    'u1',
    '12345678',
    'Juan',
    'Perez',
    'juan@test.com',
    'hashed',
    true,
    'pnf1',
    'inst1',
    'role1',
    '0412',
  );

  beforeEach(() => {
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
    useCase = new GetMeUseCase(userRepository, roleRepository);
  });

  it('should return the user profile with role name', async () => {
    userRepository.findById.mockResolvedValue(user);
    roleRepository.findById.mockResolvedValue(
      new Role('role1', 'ADMIN', 'Administrador'),
    );

    const result = await useCase.execute('u1');

    expect(result).toEqual({
      id: 'u1',
      dni: '12345678',
      firstName: 'Juan',
      lastName: 'Perez',
      email: 'juan@test.com',
      role: 'ADMIN',
      isActive: true,
      pnfId: 'pnf1',
      institutionId: 'inst1',
      phone: '0412',
    });
  });

  it('should return empty role when role is missing', async () => {
    userRepository.findById.mockResolvedValue(user);
    roleRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('u1');

    expect(result.role).toBe('');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
