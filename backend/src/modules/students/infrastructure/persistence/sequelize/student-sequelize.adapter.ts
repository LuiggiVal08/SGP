import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { StudentModel } from './models/student.model';
import { IStudentRepository } from '../../../domain/ports/IStudentRepository';
import { Student } from '../../../domain/entities/Student';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

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
      model.trajectoryId,
      model.enrollmentNumber,
      model.cohort,
      model.currentTrayecto,
    );
  }

  async findById(id: string): Promise<Student | null> {
    const student = await this.studentModel.findByPk(id);
    return this.toDomain(student);
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

  async findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<Student>> {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 10;
    const where: Record<string, unknown> = {};
    if (dto.search) {
      where.enrollmentNumber = { [Op.like]: `%${dto.search}%` };
    }
    const { rows, count } = await this.studentModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    return {
      data: rows.map((r) => this.toDomain(r) as Student),
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async save(student: Student): Promise<void> {
    await this.studentModel.upsert({
      id: student.id,
      userId: student.userId,
      trajectoryId: student.trajectoryId,
      enrollmentNumber: student.enrollmentNumber,
      cohort: student.cohort,
      currentTrayecto: student.currentTrayecto,
    });
  }

  async delete(id: string): Promise<void> {
    await this.studentModel.destroy({ where: { id } });
  }
}
