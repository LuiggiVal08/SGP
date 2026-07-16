import { Student } from '../entities/Student';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface IStudentRepository {
  findById(id: string): Promise<Student | null>;
  findByUserId(userId: string): Promise<Student | null>;
  findByEnrollmentNumber(enrollmentNumber: string): Promise<Student | null>;
  findAllPaginated(dto: PaginationDto): Promise<PaginatedResult<Student>>;
  save(student: Student): Promise<void>;
  delete(id: string): Promise<void>;
}
