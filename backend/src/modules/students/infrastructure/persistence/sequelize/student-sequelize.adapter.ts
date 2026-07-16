import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StudentModel } from './models/student.model';
import { IStudentRepository } from '../../../domain/ports/IStudentRepository';
import { Student } from '../../../domain/entities/Student';

@Injectable()
export class StudentSequelizeAdapter implements IStudentRepository {
  constructor(
    @InjectModel(StudentModel)
    private readonly studentModel: typeof StudentModel,
  ) {}

  private toDomain(model: StudentModel | null): Student | null {
    if (!model) return null;
    return new Student(
      model.id,
      model.userId,
      model.enrollmentNumber,
      model.cohort,
      model.currentTrayecto,
    );
  }

  async findByUserId(userId: string): Promise<Student | null> {
    const student = await this.studentModel.findOne({ where: { userId } });
    return this.toDomain(student);
  }

  async findByEnrollmentNumber(
    enrollmentNumber: string,
  ): Promise<Student | null> {
    const student = await this.studentModel.findOne({
      where: { enrollmentNumber },
    });
    return this.toDomain(student);
  }

  async save(student: Student): Promise<void> {
    await this.studentModel.upsert({
      id: student.id,
      userId: student.userId,
      enrollmentNumber: student.enrollmentNumber,
      cohort: student.cohort,
      currentTrayecto: student.currentTrayecto,
    });
  }
}
