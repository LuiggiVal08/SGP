import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IHashService } from '@modules/auth/domain/ports/IHashService';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';
import { IPnfRepository } from '@modules/pnf/domain/ports/IPnfRepository';
import { IInstitutionRepository } from '@modules/institutions/domain/ports/IInstitutionRepository';
import { User } from '../../domain/entities/User';
import { Role } from '@modules/roles/domain/entities/Role';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashService: jest.Mocked<IHashService>;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let pnfRepository: jest.Mocked<IPnfRepository>;
  let institutionRepository: jest.Mocked<IInstitutionRepository>;

  const input = {
    dni: '12345678',
    firstName: 'Juan',
    lastName: 'Perez',
    email: 'juan@test.com',
    password: 'secret123',
    roleName: 'PROFESOR',
    pnfId: 'pnf1',
    institutionId: 'inst1',
    phone: '0412',
  };

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
    hashService = {
      hash: jest.fn().mockResolvedValue('hashed'),
      compare: jest.fn(),
    };
    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn().mockResolvedValue(new Role('r1', 'PROFESOR', '')),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    pnfRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'pnf1' }),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findByInstitutionId: jest.fn(),
      countByInstitutionId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    institutionRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'inst1' }),
      findByCoordinatorId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateUserUseCase(
      userRepository,
      hashService,
      roleRepository,
      pnfRepository,
      institutionRepository,
    );
  });

  it('should create a user with hashed password', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByDni.mockResolvedValue(null);

    const result = await useCase.execute(input);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(hashService.hash).toHaveBeenCalledWith('secret123');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const saved = userRepository.save.mock.calls[0][0];
    expect(saved.password).toBe('hashed');
    expect(saved.roleId).toBe('r1');
    expect(result.roleName).toBe('PROFESOR');
  });

  it('should throw ConflictException on duplicate email', async () => {
    userRepository.findByEmail.mockResolvedValue(
      new User('x', 'd', 'a', 'b', 'juan@test.com', 'h', true, '', '', 'r1'),
    );
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('should throw ConflictException on duplicate dni', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByDni.mockResolvedValue(
      new User(
        'x',
        '12345678',
        'a',
        'b',
        'other@test.com',
        'h',
        true,
        '',
        '',
        'r1',
      ),
    );
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('should throw NotFoundException when role does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByDni.mockResolvedValue(null);
    roleRepository.findByName.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should throw BadRequestException on invalid pnf', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByDni.mockResolvedValue(null);
    pnfRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should throw BadRequestException on invalid institution', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByDni.mockResolvedValue(null);
    institutionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
