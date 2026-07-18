import { UpdatePnfUseCase } from './update-pnf.use-case';
import { IPnfRepository } from '../../domain/ports/IPnfRepository';
import { Pnf } from '../../domain/entities/Pnf';
import { NotFoundException } from '@nestjs/common';

describe('UpdatePnfUseCase', () => {
  let useCase: UpdatePnfUseCase;
  let pnfRepository: jest.Mocked<IPnfRepository>;
  let professorRepository: { findById: jest.Mock };

  const existingPnf = new Pnf(
    'pnf-uuid',
    'Old Name',
    'institution-uuid',
    undefined,
  );

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
    professorRepository = { findById: jest.fn() };

    useCase = new UpdatePnfUseCase(pnfRepository, professorRepository);
  });

  it('should throw NotFoundException when pnf does not exist', async () => {
    pnfRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('pnf-uuid', 'New Name')).rejects.toThrow(
      NotFoundException,
    );

    expect(pnfRepository.save).not.toHaveBeenCalled();
  });

  it('should assign a valid coordinatorId to a PNF', async () => {
    pnfRepository.findById.mockResolvedValue(existingPnf);
    professorRepository.findById.mockResolvedValue({ id: 'prof-uuid' });

    const result = await useCase.execute(
      'pnf-uuid',
      'New Name',
      undefined,
      'prof-uuid',
    );

    expect(result.coordinatorId).toBe('prof-uuid');

    expect(professorRepository.findById).toHaveBeenCalledWith('prof-uuid');

    expect(pnfRepository.save).toHaveBeenCalledWith(
      new Pnf('pnf-uuid', 'New Name', 'institution-uuid', 'prof-uuid'),
    );
  });

  it('should reject assignment when coordinator professor does not exist', async () => {
    pnfRepository.findById.mockResolvedValue(existingPnf);
    professorRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('pnf-uuid', 'New Name', undefined, 'ghost-prof'),
    ).rejects.toThrow(NotFoundException);

    expect(pnfRepository.save).not.toHaveBeenCalled();
  });

  it('should update coordinatorId to another professor', async () => {
    pnfRepository.findById.mockResolvedValue(existingPnf);
    professorRepository.findById.mockResolvedValue({ id: 'other-prof' });

    const result = await useCase.execute(
      'pnf-uuid',
      'New Name',
      undefined,
      'other-prof',
    );

    expect(result.coordinatorId).toBe('other-prof');

    expect(pnfRepository.save).toHaveBeenCalledWith(
      new Pnf('pnf-uuid', 'New Name', 'institution-uuid', 'other-prof'),
    );
  });

  it('should keep existing coordinatorId when none provided', async () => {
    pnfRepository.findById.mockResolvedValue(
      new Pnf('pnf-uuid', 'Old Name', 'institution-uuid', 'existing-prof'),
    );
    professorRepository.findById.mockResolvedValue({ id: 'existing-prof' });

    const result = await useCase.execute('pnf-uuid', 'New Name');

    expect(result.coordinatorId).toBe('existing-prof');

    expect(professorRepository.findById).not.toHaveBeenCalled();
  });
});
