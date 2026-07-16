import { GetAllInstitutionsUseCase } from './get-all-institutions.use-case';
import { IInstitutionRepository } from '../../domain/ports/IInstitutionRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { Institution } from '../../domain/entities/Institution';

describe('GetAllInstitutionsUseCase', () => {
  let useCase: GetAllInstitutionsUseCase;
  let institutionRepository: jest.Mocked<IInstitutionRepository>;
  let cacheService: jest.Mocked<ICacheService>;

  const mockInstitutions = [
    new Institution('uuid-1', 'University A', 'UA', 'a@edu.com', ''),
    new Institution('uuid-2', 'University B', 'UB', 'b@edu.com', ''),
  ];

  const mockPaginated = {
    data: [mockInstitutions[0]],
    meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
  };

  beforeEach(() => {
    institutionRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetAllInstitutionsUseCase(
      institutionRepository,
      cacheService,
    );
  });

  it('should return all institutions from cache when no pagination', async () => {
    cacheService.get.mockResolvedValue(JSON.stringify(mockInstitutions));

    const result = await useCase.execute();

    expect(result).toEqual(mockInstitutions);
    expect(institutionRepository.findAll).not.toHaveBeenCalled();
  });

  it('should fetch and cache institutions when cache is empty', async () => {
    cacheService.get.mockResolvedValue(null);
    institutionRepository.findAll.mockResolvedValue(mockInstitutions);

    const result = await useCase.execute();

    expect(result).toEqual(mockInstitutions);
    expect(cacheService.set).toHaveBeenCalledWith(
      'catalogs:institutions',
      JSON.stringify(mockInstitutions),
      86400,
    );
  });

  it('should return paginated results when pagination params are provided', async () => {
    institutionRepository.findAllPaginated.mockResolvedValue(mockPaginated);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result).toEqual(mockPaginated);
    expect(institutionRepository.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(cacheService.get).not.toHaveBeenCalled();
  });

  it('should return all institutions when empty dto is passed', async () => {
    cacheService.get.mockResolvedValue(null);
    institutionRepository.findAll.mockResolvedValue(mockInstitutions);

    const result = await useCase.execute({});

    expect(result).toEqual(mockInstitutions);
    expect(institutionRepository.findAll).toHaveBeenCalled();
  });
});
