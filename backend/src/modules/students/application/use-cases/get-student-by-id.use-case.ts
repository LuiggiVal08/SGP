import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStudentRepository } from '../../domain/ports/IStudentRepository';
import { Student } from '../../domain/entities/Student';

@Injectable()
export class GetStudentByIdUseCase {
  constructor(
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(id: string): Promise<Student> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    return student;
  }
}
