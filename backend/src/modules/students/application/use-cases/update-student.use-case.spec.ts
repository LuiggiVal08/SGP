import { UpdateStudentUseCase } from './update-student.use-case';
import { IStudentRepository } from '../../domain/ports/IStudentRepository';
import { Student } from '../../domain/entities/Student';
import { NotFoundException } from '@nestjs/common';

describe('UpdateStudentUseCase', () => {
  let useCase: UpdateStudentUseCase;
  let studentRepository: jest.Mocked<IStudentRepository>;

  beforeEach(() => {
    studentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByEnrollmentNumber: jest.fn(),
      findProfileById: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateStudentUseCase(studentRepository);
  });

  it('should update a student profile trajectory and cohort', async () => {
    const existing = new Student(
      'uuid-1',
      'user-1',
      'traj-1',
      '2024-001',
      2024,
      1,
    );
    studentRepository.findById.mockResolvedValue(existing);
    studentRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute('uuid-1', {
      trajectoryId: 'traj-2',
      cohort: 2025,
    });

    expect(result).toBeInstanceOf(Student);
    expect(result.id).toBe('uuid-1');
    expect(result.trajectoryId).toBe('traj-2');
    expect(result.cohort).toBe(2025);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(studentRepository.save).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(studentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'uuid-1',
        trajectoryId: 'traj-2',
        cohort: 2025,
        enrollmentNumber: '2024-001',
      }),
    );
  });

  it('should throw NotFoundException when student does not exist', async () => {
    studentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1', { cohort: 2025 })).rejects.toThrow(
      NotFoundException,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(studentRepository.save).not.toHaveBeenCalled();
  });
});
