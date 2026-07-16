import { DeletePnfUseCase } from './delete-pnf.use-case';
import { IPnfRepository } from '../../domain/ports/IPnfRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { Pnf } from '../../domain/entities/Pnf';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('DeletePnfUseCase', () => {
  let useCase: DeletePnfUseCase;
  let pnfRepository: jest.Mocked<IPnfRepository>;
  let cacheService: jest.Mocked<ICacheService>;
  let userRepository: { countByPnfId: jest.Mock };
  let projectRepository: { countByPnfId: jest.Mock };

  const mockPnf = new Pnf('uuid-1', 'Computer Science', 'institution-uuid');

  beforeEach(() => {
    pnfRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findByInstitutionId: jest.fn(),
      countByInstitutionId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
    userRepository = { countByPnfId: jest.fn() };
    projectRepository = { countByPnfId: jest.fn() };

    useCase = new DeletePnfUseCase(
      pnfRepository,
      cacheService,
      userRepository,
      projectRepository,
    );
  });

  it('should delete pnf when no dependencies exist', async () => {
    pnfRepository.findById.mockResolvedValue(mockPnf);
    userRepository.countByPnfId.mockResolvedValue(0);
    projectRepository.countByPnfId.mockResolvedValue(0);

    await useCase.execute('uuid-1');

    expect(pnfRepository.delete).toHaveBeenCalledWith('uuid-1');
    expect(cacheService.delete).toHaveBeenCalledWith('catalogs:pnf');
  });

  it('should throw NotFoundException when pnf does not exist', async () => {
    pnfRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
    expect(pnfRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when pnf has associated users', async () => {
    pnfRepository.findById.mockResolvedValue(mockPnf);
    userRepository.countByPnfId.mockResolvedValue(2);
    projectRepository.countByPnfId.mockResolvedValue(0);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(ConflictException);
    expect(pnfRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when pnf has associated projects', async () => {
    pnfRepository.findById.mockResolvedValue(mockPnf);
    userRepository.countByPnfId.mockResolvedValue(0);
    projectRepository.countByPnfId.mockResolvedValue(1);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(ConflictException);
    expect(pnfRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when pnf has both users and projects', async () => {
    pnfRepository.findById.mockResolvedValue(mockPnf);
    userRepository.countByPnfId.mockResolvedValue(2);
    projectRepository.countByPnfId.mockResolvedValue(1);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(ConflictException);
    expect(pnfRepository.delete).not.toHaveBeenCalled();
  });
});
