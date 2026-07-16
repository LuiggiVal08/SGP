import { CreateProjectCorrectionUseCase } from './create-project-correction.use-case';
import { IProjectCorrectionRepository } from '../../domain/ports/IProjectCorrectionRepository';
import { IProjectRepository } from '@modules/projects/domain/ports/IProjectRepository';
import { ProjectCorrection } from '../../domain/entities/ProjectCorrection';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ProjectFileModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project-file.model';

describe('CreateProjectCorrectionUseCase', () => {
  let useCase: CreateProjectCorrectionUseCase;
  let correctionRepository: jest.Mocked<IProjectCorrectionRepository>;
  let projectRepository: jest.Mocked<IProjectRepository>;
  const projectFileModel = {
    findByPk: jest.fn(),
  } as unknown as jest.Mocked<typeof ProjectFileModel>;

  const mockProject = {
    id: 'project-1',
    title: 'Project',
    year: 2024,
    status: 'PENDING_VALIDATION',
    careerId: 'career-1',
    tutorId: 'tutor-1',
  } as never;

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
      findByCareer: jest.fn(),
      findByTutor: jest.fn(),
      save: jest.fn(),
      saveFiles: jest.fn(),
      findFileById: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateProjectCorrectionUseCase(
      correctionRepository,
      projectRepository,
      projectFileModel,
    );
  });

  it('should create a correction on a TOMO file', async () => {
    projectRepository.findById.mockResolvedValue(mockProject);
    projectFileModel.findByPk.mockResolvedValue({
      id: 'file-1',
      projectId: 'project-1',
      documentType: 'TOMO',
    });

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
    projectRepository.findById.mockResolvedValue(mockProject);
    projectFileModel.findByPk.mockResolvedValue(null);

    await expect(
      useCase.execute({ projectId: 'project-1', fileId: 'file-1' }),
    ).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(correctionRepository.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when file is not TOMO', async () => {
    projectRepository.findById.mockResolvedValue(mockProject);
    projectFileModel.findByPk.mockResolvedValue({
      id: 'file-1',
      projectId: 'project-1',
      documentType: 'RESUMEN',
    });

    await expect(
      useCase.execute({ projectId: 'project-1', fileId: 'file-1' }),
    ).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(correctionRepository.save).not.toHaveBeenCalled();
  });
});
