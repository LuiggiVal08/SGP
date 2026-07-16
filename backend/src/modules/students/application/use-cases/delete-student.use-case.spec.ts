import { DeleteStudentUseCase } from './delete-student.use-case';
import { IStudentRepository } from '../../domain/ports/IStudentRepository';
import { Student } from '../../domain/entities/Student';
import { NotFoundException } from '@nestjs/common';

describe('DeleteStudentUseCase', () => {
  let useCase: DeleteStudentUseCase;
  let studentRepository: jest.Mocked<IStudentRepository>;

  const mockStudent = new Student(
    'uuid-1',
    'user-1',
    'traj-1',
    '2024-001',
    2024,
    1,
  );

  beforeEach(() => {
    studentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByEnrollmentNumber: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteStudentUseCase(studentRepository);
  });

  it('should delete a student by id', async () => {
    studentRepository.findById.mockResolvedValue(mockStudent);

    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(studentRepository.delete).toHaveBeenCalledWith('uuid-1');
  });

  it('should throw NotFoundException when student does not exist', async () => {
    studentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(studentRepository.delete).not.toHaveBeenCalled();
  });
});
