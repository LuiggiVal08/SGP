import { DeleteProjectCorrectionUseCase } from './delete-project-correction.use-case';
import { IProjectCorrectionRepository } from '../../domain/ports/IProjectCorrectionRepository';
import { ProjectCorrection } from '../../domain/entities/ProjectCorrection';
import { NotFoundException } from '@nestjs/common';

describe('DeleteProjectCorrectionUseCase', () => {
  let useCase: DeleteProjectCorrectionUseCase;
  let correctionRepository: jest.Mocked<IProjectCorrectionRepository>;

  const mockCorrection = new ProjectCorrection(
    'uuid-1',
    'project-1',
    'file-1',
    'Comentario',
    'PENDIENTE',
    null,
    null,
  );

  beforeEach(() => {
    correctionRepository = {
      findById: jest.fn(),
      findAllByProjectPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteProjectCorrectionUseCase(correctionRepository);
  });

  it('should delete an existing correction', async () => {
    correctionRepository.findById.mockResolvedValue(mockCorrection);

    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(correctionRepository.delete).toHaveBeenCalledWith('uuid-1');
  });

  it('should throw NotFoundException when correction does not exist', async () => {
    correctionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(correctionRepository.delete).not.toHaveBeenCalled();
  });
});
