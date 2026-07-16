import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SubjectModel } from './infrastructure/persistence/sequelize/models/subject.model';
import { SubjectSequelizeAdapter } from './infrastructure/persistence/sequelize/subject-sequelize.adapter';
import { GetAllSubjectsUseCase } from './application/use-cases/get-all-subjects.use-case';
import { CreateSubjectUseCase } from './application/use-cases/create-subject.use-case';
import { UpdateSubjectUseCase } from './application/use-cases/update-subject.use-case';
import { DeleteSubjectUseCase } from './application/use-cases/delete-subject.use-case';
import { SubjectController } from './infrastructure/http/controllers/subject.controller';
import { TrajectoriesModule } from '@modules/trajectories/trajectories.module';

@Module({
  imports: [
    SequelizeModule.forFeature([SubjectModel]),
    forwardRef(() => TrajectoriesModule),
  ],
  providers: [
    {
      provide: 'ISubjectRepository',
      useClass: SubjectSequelizeAdapter,
    },
    GetAllSubjectsUseCase,
    CreateSubjectUseCase,
    UpdateSubjectUseCase,
    DeleteSubjectUseCase,
  ],
  controllers: [SubjectController],
  exports: ['ISubjectRepository'],
})
export class SubjectsModule {}
