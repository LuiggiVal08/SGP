import { ImportUsersCsvUseCase } from './import-users-csv.use-case';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IHashService } from '@modules/auth/domain/ports/IHashService';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';
import { IPnfRepository } from '@modules/pnf/domain/ports/IPnfRepository';
import { IInstitutionRepository } from '@modules/institutions/domain/ports/IInstitutionRepository';
import { User } from '../../domain/entities/User';
import { Role } from '@modules/roles/domain/entities/Role';

const VALID_ROLES = ['ALUMNO', 'DOCENTE', 'COORDINADOR'];

describe('ImportUsersCsvUseCase', () => {
  let useCase: ImportUsersCsvUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashService: jest.Mocked<IHashService>;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let pnfRepository: jest.Mocked<IPnfRepository>;
  let institutionRepository: jest.Mocked<IInstitutionRepository>;

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
      findByName: jest
        .fn()
        .mockImplementation((name: string) =>
          Promise.resolve(
            ImportUsersCsvUseCase.VALID_ROLES.includes(name)
              ? new Role('r-' + name, name, '')
              : null,
          ),
        ),
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
    useCase = new ImportUsersCsvUseCase(
      userRepository,
      hashService,
      roleRepository,
      pnfRepository,
      institutionRepository,
    );
  });

  it('should create students from the CSV', async () => {
    const csv =
      'dni,firstName,lastName,email,password,roleName,pnfId,institutionId\n' +
      '1,Ana,Lopez,ana@test.com,secret1,ALUMNO,pnf1,inst1\n' +
      '2,Luis,Gomez,luis@test.com,secret1,ALUMNO,pnf1,inst1';

    const result = await useCase.execute(csv);

    expect(userRepository.save).toHaveBeenCalledTimes(2);
    expect(result.created).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should skip duplicate rows (email/dni already exists)', async () => {
    userRepository.findByEmail.mockImplementation((email: string) =>
      Promise.resolve(
        email === 'dup@test.com'
          ? new User(
              'x',
              '9',
              'a',
              'b',
              'dup@test.com',
              'h',
              true,
              '',
              '',
              'r1',
            )
          : null,
      ),
    );
    userRepository.findByDni.mockResolvedValue(null);

    const csv =
      'dni,firstName,lastName,email,password,roleName,pnfId,institutionId\n' +
      '9,Dup,User,dup@test.com,secret1,ALUMNO,pnf1,inst1\n' +
      '8,New,User,new@test.com,secret1,ALUMNO,pnf1,inst1';

    const result = await useCase.execute(csv);

    expect(result.created).toBe(1);
    expect(result.skipped).toBe(1);

    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should mark a COORDINADOR row as a user with roleName COORDINADOR', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByDni.mockResolvedValue(null);

    const csv =
      'dni,firstName,lastName,email,password,roleName,pnfId,institutionId\n' +
      '5,Cara,Coord,coord@test.com,secret1,COORDINADOR,pnf1,inst1';

    const result = await useCase.execute(csv);

    expect(result.created).toBe(1);
    const saved: User = userRepository.save.mock.calls[0][0];
    expect(saved.roleId).toBe('r-COORDINADOR');
  });

  it('should reject an invalid role and collect the error without failing the batch', async () => {
    roleRepository.findByName.mockImplementation((name: string) =>
      Promise.resolve(name === 'ALUMNO' ? new Role('ra', 'ALUMNO', '') : null),
    );
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByDni.mockResolvedValue(null);

    const csv =
      'dni,firstName,lastName,email,password,roleName,pnfId,institutionId\n' +
      '3,Bad,Role,bad@test.com,secret1,SUPERADMIN,pnf1,inst1\n' +
      '4,Good,Role,good@test.com,secret1,ALUMNO,pnf1,inst1';

    const result = await useCase.execute(csv);

    expect(result.created).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.errors[0]).toMatch(/SUPERADMIN/i);
  });

  it('should validate required fields and collect row errors', async () => {
    const csv =
      'dni,firstName,lastName,email,password,roleName,pnfId,institutionId\n' +
      '6,No,Email,,secret1,ALUMNO,pnf1,inst1';

    const result = await useCase.execute(csv);

    expect(result.created).toBe(0);
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
  });

  it('exposes the whitelist of valid roles', () => {
    expect(ImportUsersCsvUseCase.VALID_ROLES).toEqual(
      expect.arrayContaining(VALID_ROLES),
    );
  });
});
