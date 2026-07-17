import { DeleteInstitutionUseCase } from './delete-institution.use-case';
import { IInstitutionRepository } from '../../domain/ports/IInstitutionRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { Institution } from '../../domain/entities/Institution';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('DeleteInstitutionUseCase', () => {
  let useCase: DeleteInstitutionUseCase;
  let institutionRepository: jest.Mocked<IInstitutionRepository>;
  let cacheService: jest.Mocked<ICacheService>;
  let userRepository: { countByInstitutionId: jest.Mock };
  let pnfRepository: { countByInstitutionId: jest.Mock };

  const mockInstitution = new Institution(
    'uuid-1',
    'Test University',
    'TU',
    'test@edu.com',
    'Contact info',
  );

  beforeEach(() => {
    institutionRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
    userRepository = { countByInstitutionId: jest.fn() };
    pnfRepository = { countByInstitutionId: jest.fn() };

    useCase = new DeleteInstitutionUseCase(
      institutionRepository,
      cacheService,
      userRepository,
      pnfRepository,
    );
  });

  it('should delete institution when no users are associated', async () => {
    institutionRepository.findById.mockResolvedValue(mockInstitution);
    userRepository.countByInstitutionId.mockResolvedValue(0);

    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(institutionRepository.delete).toHaveBeenCalledWith('uuid-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cacheService.delete).toHaveBeenCalledWith('catalogs:institutions');
  });

  it('should throw NotFoundException when institution does not exist', async () => {
    institutionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(institutionRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when institution has associated users', async () => {
    institutionRepository.findById.mockResolvedValue(mockInstitution);
    userRepository.countByInstitutionId.mockResolvedValue(3);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(ConflictException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(institutionRepository.delete).not.toHaveBeenCalled();
  });
});
