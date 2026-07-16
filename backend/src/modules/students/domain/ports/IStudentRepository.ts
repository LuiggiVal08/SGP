import { Student } from '../entities/Student';

export interface IStudentRepository {
  findByUserId(userId: string): Promise<Student | null>;
  findByEnrollmentNumber(enrollmentNumber: string): Promise<Student | null>;
  save(student: Student): Promise<void>;
}
