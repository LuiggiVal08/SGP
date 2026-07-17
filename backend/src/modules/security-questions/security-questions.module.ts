import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { QuestionModel } from './infrastructure/persistence/sequelize/models/question.model';
import { UserQuestionModel } from './infrastructure/persistence/sequelize/models/user-question.model';
import { QuestionSequelizeAdapter } from './infrastructure/persistence/sequelize/question-sequelize.adapter';
import { UserQuestionSequelizeAdapter } from './infrastructure/persistence/sequelize/user-question-sequelize.adapter';
import { GetQuestionsUseCase } from './application/use-cases/get-questions.use-case';
import { GetUserQuestionsUseCase } from './application/use-cases/get-user-questions.use-case';
import { SetUserQuestionsUseCase } from './application/use-cases/set-user-questions.use-case';
import { SecurityQuestionsController } from './infrastructure/http/controllers/security-questions.controller';
import { BcryptHashAdapter } from '../auth/infrastructure/services/bcrypt-hash.adapter';

@Module({
  imports: [SequelizeModule.forFeature([QuestionModel, UserQuestionModel])],
  providers: [
    {
      provide: 'IQuestionRepository',
      useClass: QuestionSequelizeAdapter,
    },
    {
      provide: 'IUserQuestionRepository',
      useClass: UserQuestionSequelizeAdapter,
    },
    {
      provide: 'IHashService',
      useClass: BcryptHashAdapter,
    },
    GetQuestionsUseCase,
    GetUserQuestionsUseCase,
    SetUserQuestionsUseCase,
  ],
  controllers: [SecurityQuestionsController],
  exports: ['IUserQuestionRepository', 'IQuestionRepository'],
})
export class SecurityQuestionsModule {}
