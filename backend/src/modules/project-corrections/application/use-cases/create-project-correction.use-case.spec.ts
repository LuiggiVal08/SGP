import { CreateProjectCorrectionUseCase } from './create-project-correction.use-case';
import { IProjectCorrectionRepository } from '../../domain/ports/IProjectCorrectionRepository';
import { IProjectRepository } from '@modules/projects/domain/ports/IProjectRepository';
import { ProjectCorrection } from '../../domain/entities/ProjectCorrection';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CreateProjectCorrectionUseCase', () => {
  let useCase: CreateProjectCorrectionUseCase;
  let correctionRepository: jest.Mocked<IProjectCorrectionRepository>;
  let projectRepository: jest.Mocked<IProjectRepository>;

  beforeEach(() => {
    correctionRepository = {
      findById: jest.fn(),
      findAllByProjectPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    projectRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findBySubjectAssignment: jest.fn(),
      findByLocation: jest.fn(),
      findByCommunityTutor: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findAllPaginated: jest.fn(),
      countFiles: jest.fn(),
      countByStatus: jest.fn(),
      countByYear: jest.fn(),
      countThisYear: jest.fn(),
      findRecentActivity: jest.fn(),
      findRecentActivityWithTimestamps: jest.fn(),
      saveFiles: jest.fn(),
      findFileById: jest.fn(),
      findFilesByProjectId: jest.fn(),
      deleteFile: jest.fn(),
      getMaxVersion: jest.fn(),
      findMilestonesByProject: jest.fn(),
      findMilestoneById: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestoneStatus: jest.fn(),
      findRevisionsByMilestone: jest.fn(),
      createRevision: jest.fn(),
      findDefensaByProject: jest.fn(),
      saveDefensa: jest.fn(),
      findCartasByProject: jest.fn(),
      createCarta: jest.fn(),
      deleteCartasByProject: jest.fn(),
    };

    useCase = new CreateProjectCorrectionUseCase(
      correctionRepository,
      projectRepository,
    );
  });

  it('should create a correction on a TOMO file', async () => {
    projectRepository.findById.mockResolvedValue({ id: 'project-1' } as never);
    projectRepository.findFileById.mockResolvedValue({
      id: 'file-1',
      projectId: 'project-1',
      documentType: 'TOMO',
    } as never);

    const result = await useCase.execute({
      projectId: 'project-1',
      fileId: 'file-1',
      comment: 'Revisar capítulo 2',
    });

    expect(result).toBeInstanceOf(ProjectCorrection);
    expect(result.status).toBe('PENDIENTE');
    expect(result.fileId).toBe('file-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(correctionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ projectId: 'project-1', fileId: 'file-1' }),
    ).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(correctionRepository.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when file does not exist', async () => {
    projectRepository.findById.mockResolvedValue({ id: 'project-1' } as never);
    projectRepository.findFileById.mockResolvedValue(null);

    await expect(
      useCase.execute({ projectId: 'project-1', fileId: 'file-1' }),
    ).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(correctionRepository.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when file is not TOMO', async () => {
    projectRepository.findById.mockResolvedValue({ id: 'project-1' } as never);
    projectRepository.findFileById.mockResolvedValue({
      id: 'file-1',
      projectId: 'project-1',
      documentType: 'RESUMEN',
    } as never);

    await expect(
      useCase.execute({ projectId: 'project-1', fileId: 'file-1' }),
    ).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(correctionRepository.save).not.toHaveBeenCalled();
  });
});
