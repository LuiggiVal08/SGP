import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StudentModel } from './infrastructure/persistence/sequelize/models/student.model';
import { StudentSequelizeAdapter } from './infrastructure/persistence/sequelize/student-sequelize.adapter';

@Module({
  imports: [SequelizeModule.forFeature([StudentModel])],
  providers: [
    {
      provide: 'IStudentRepository',
      useClass: StudentSequelizeAdapter,
    },
  ],
  exports: ['IStudentRepository'],
})
export class StudentsModule {}
