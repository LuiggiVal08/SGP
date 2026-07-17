import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { StudentModel } from './models/student.model';
import { IStudentRepository } from '../../../domain/ports/IStudentRepository';
import { Student } from '../../../domain/entities/Student';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';
import type { StudentProfileDto } from '../../http/dtos/student-profile.dto';

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

  async findProfileById(id: string): Promise<StudentProfileDto | null> {
    const student = await this.studentModel.findByPk(id);
    if (!student) return null;

    const sequelize = this.studentModel.sequelize!;
    const rows = await sequelize.query<{
      id: string;
      userId: string;
      firstName: string;
      lastName: string;
      email: string;
      dni: string;
      phone: string | null;
      trajectoryId: string;
      trajectoryName: string;
      enrollmentNumber: string;
      cohort: number;
      currentTrayecto: number;
      subjectId: string | null;
      subjectName: string | null;
    }>(
      `SELECT st.id, st.userId, u.firstName, u.lastName, u.email, u.dni, u.phone,
              st.trajectoryId, t.name AS trajectoryName,
              st.enrollmentNumber, st.cohort, st.currentTrayecto,
              s.id AS subjectId, s.name AS subjectName
       FROM students st
       INNER JOIN users u ON u.id = st.userId
       INNER JOIN trajectories t ON t.id = st.trajectoryId
       LEFT JOIN subjects s ON s.trajectoryId = st.trajectoryId
       WHERE st.id = :id
       ORDER BY s.name ASC`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );

    if (rows.length === 0) return null;

    const first = rows[0];
    const subjects = rows
      .filter((r) => r.subjectId !== null)
      .map((r) => ({
        id: r.subjectId!,
        name: r.subjectName!,
      }));

    return {
      id: first.id,
      userId: first.userId,
      firstName: first.firstName,
      lastName: first.lastName,
      email: first.email,
      dni: first.dni,
      phone: first.phone,
      trajectoryId: first.trajectoryId,
      trajectoryName: first.trajectoryName,
      enrollmentNumber: first.enrollmentNumber,
      cohort: first.cohort,
      currentTrayecto: first.currentTrayecto,
      subjects,
    };
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
