import { DeleteProjectSubjectAssignmentUseCase } from './delete-project-subject-assignment.use-case';
import { IProjectSubjectAssignmentRepository } from '../../domain/ports/IProjectSubjectAssignmentRepository';
import { ProjectSubjectAssignment } from '../../domain/entities/ProjectSubjectAssignment';
import { NotFoundException } from '@nestjs/common';

describe('DeleteProjectSubjectAssignmentUseCase', () => {
  let useCase: DeleteProjectSubjectAssignmentUseCase;
  let assignmentRepository: jest.Mocked<IProjectSubjectAssignmentRepository>;

  const mockAssignment = new ProjectSubjectAssignment(
    'uuid-1',
    'subject-1',
    'professor-1',
    'period-1',
  );

  beforeEach(() => {
    assignmentRepository = {
      findById: jest.fn(),
      findAllPaginated: jest.fn(),
      findByUnique: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteProjectSubjectAssignmentUseCase(assignmentRepository);
  });

  it('should delete an assignment when it exists', async () => {
    assignmentRepository.findById.mockResolvedValue(mockAssignment);

    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(assignmentRepository.delete).toHaveBeenCalledWith('uuid-1');
  });

  it('should throw NotFoundException when assignment does not exist', async () => {
    assignmentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(assignmentRepository.delete).not.toHaveBeenCalled();
  });
});
