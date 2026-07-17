import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StudentModel } from './infrastructure/persistence/sequelize/models/student.model';
import { StudentSequelizeAdapter } from './infrastructure/persistence/sequelize/student-sequelize.adapter';
import { GetAllStudentsUseCase } from './application/use-cases/get-all-students.use-case';
import { GetStudentProfileUseCase } from './application/use-cases/get-student-profile.use-case';
import { UpdateStudentUseCase } from './application/use-cases/update-student.use-case';
import { DeleteStudentUseCase } from './application/use-cases/delete-student.use-case';
import { StudentController } from './infrastructure/http/controllers/student.controller';
import { TrajectoriesModule } from '@modules/trajectories/trajectories.module';

@Module({
  imports: [SequelizeModule.forFeature([StudentModel]), TrajectoriesModule],
  providers: [
    {
      provide: 'IStudentRepository',
      useClass: StudentSequelizeAdapter,
    },
    GetAllStudentsUseCase,
    GetStudentProfileUseCase,
    UpdateStudentUseCase,
    DeleteStudentUseCase,
  ],
  controllers: [StudentController],
  exports: ['IStudentRepository', SequelizeModule],
})
export class StudentsModule {}
