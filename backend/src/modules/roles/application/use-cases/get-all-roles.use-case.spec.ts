import { GetAllRolesUseCase } from './get-all-roles.use-case';
import { IRoleRepository } from '../../domain/ports/IRoleRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { Role } from '../../domain/entities/Role';

describe('GetAllRolesUseCase', () => {
  let useCase: GetAllRolesUseCase;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let cacheService: jest.Mocked<ICacheService>;

  const roles = [
    new Role('1', 'ADMIN', 'Administrador'),
    new Role('2', 'PROFESOR', 'Profesor'),
  ];

  beforeEach(() => {
    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetAllRolesUseCase(roleRepository, cacheService);
  });

  it('should return roles from cache when present', async () => {
    cacheService.get.mockResolvedValue(JSON.stringify(roles));

    expect(await useCase.execute()).toEqual(roles);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cacheService.get).toHaveBeenCalledWith('catalogs:roles');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(roleRepository.findAll).not.toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cacheService.set).not.toHaveBeenCalled();
  });

  it('should fetch from repository and cache the result when cache is empty', async () => {
    cacheService.get.mockResolvedValue(null);
    roleRepository.findAll.mockResolvedValue(roles);

    expect(await useCase.execute()).toEqual(roles);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cacheService.set).toHaveBeenCalledWith(
      'catalogs:roles',
      JSON.stringify(roles),
      86400,
    );
  });
});
