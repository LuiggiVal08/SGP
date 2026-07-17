import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStudentRepository } from '../../domain/ports/IStudentRepository';
import { Student } from '../../domain/entities/Student';

@Injectable()
export class UpdateStudentUseCase {
  constructor(
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(
    id: string,
    data: {
      trajectoryId?: string;
      enrollmentNumber?: string;
      cohort?: number;
      currentTrayecto?: number;
    },
  ) {
    const existing = await this.studentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    const student = new Student(
      id,
      existing.userId,
      data.trajectoryId ?? existing.trajectoryId,
      data.enrollmentNumber ?? existing.enrollmentNumber,
      data.cohort ?? existing.cohort,
      data.currentTrayecto ?? existing.currentTrayecto,
    );
    await this.studentRepository.save(student);
    return student;
  }
}
