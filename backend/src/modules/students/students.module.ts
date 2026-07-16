import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StudentModel } from './infrastructure/persistence/sequelize/models/student.model';
import { StudentSequelizeAdapter } from './infrastructure/persistence/sequelize/student-sequelize.adapter';
import { GetAllStudentsUseCase } from './application/use-cases/get-all-students.use-case';
import { GetStudentByIdUseCase } from './application/use-cases/get-student-by-id.use-case';
import { UpdateStudentUseCase } from './application/use-cases/update-student.use-case';
import { DeleteStudentUseCase } from './application/use-cases/delete-student.use-case';
import { StudentController } from './infrastructure/http/controllers/student.controller';

@Module({
  imports: [SequelizeModule.forFeature([StudentModel])],
  providers: [
    {
      provide: 'IStudentRepository',
      useClass: StudentSequelizeAdapter,
    },
    GetAllStudentsUseCase,
    GetStudentByIdUseCase,
    UpdateStudentUseCase,
    DeleteStudentUseCase,
  ],
  controllers: [StudentController],
  exports: ['IStudentRepository'],
})
export class StudentsModule {}
