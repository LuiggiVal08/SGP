import { Student } from '../entities/Student';

export interface IStudentRepository {
  findById(id: string): Promise<Student | null>;
  findByUserId(userId: string): Promise<Student | null>;
  findByEnrollmentNumber(enrollmentNumber: string): Promise<Student | null>;
  save(student: Student): Promise<void>;
  delete(id: string): Promise<void>;
}
