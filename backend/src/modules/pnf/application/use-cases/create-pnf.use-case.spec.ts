import { CreatePnfUseCase } from './create-pnf.use-case';
import { IPnfRepository } from '../../domain/ports/IPnfRepository';
import { NotFoundException } from '@nestjs/common';

describe('CreatePnfUseCase', () => {
  let useCase: CreatePnfUseCase;
  let pnfRepository: jest.Mocked<IPnfRepository>;
  let institutionRepository: { findById: jest.Mock };
  let professorRepository: { findById: jest.Mock };

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
    institutionRepository = { findById: jest.fn() };
    professorRepository = { findById: jest.fn() };

    useCase = new CreatePnfUseCase(
      pnfRepository,
      institutionRepository,
      professorRepository,
    );
  });

  it('should create a PNF with a valid coordinatorId', async () => {
    institutionRepository.findById.mockResolvedValue({
      id: 'institution-uuid',
    });
    professorRepository.findById.mockResolvedValue({ id: 'prof-uuid' });
    pnfRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(
      'Computer Science',
      'institution-uuid',
      'prof-uuid',
    );

    expect(result.coordinatorId).toBe('prof-uuid');

    expect(professorRepository.findById).toHaveBeenCalledWith('prof-uuid');

    expect(pnfRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should create a PNF without coordinatorId', async () => {
    institutionRepository.findById.mockResolvedValue({
      id: 'institution-uuid',
    });

    const result = await useCase.execute(
      'Computer Science',
      'institution-uuid',
      undefined,
    );

    expect(result.coordinatorId).toBeUndefined();

    expect(professorRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when institution does not exist', async () => {
    institutionRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('Computer Science', 'ghost-inst', 'prof-uuid'),
    ).rejects.toThrow(NotFoundException);

    expect(pnfRepository.save).not.toHaveBeenCalled();
  });

  it('should reject coordinator assignment when professor does not exist', async () => {
    institutionRepository.findById.mockResolvedValue({
      id: 'institution-uuid',
    });
    professorRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('Computer Science', 'institution-uuid', 'ghost-prof'),
    ).rejects.toThrow(NotFoundException);

    expect(pnfRepository.save).not.toHaveBeenCalled();
  });
});
