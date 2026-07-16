import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IUserQuestionRepository } from '../../../domain/ports/IUserQuestionRepository';
import { UserQuestionModel } from './models/user-question.model';
import { UserQuestion } from '../../../domain/entities/UserQuestion';

@Injectable()
export class UserQuestionSequelizeAdapter implements IUserQuestionRepository {
  constructor(
    @InjectModel(UserQuestionModel)
    private readonly userQuestionModel: typeof UserQuestionModel,
  ) {}

  private toDomain(model: UserQuestionModel): UserQuestion {
    return new UserQuestion(
      model.id,
      model.userId,
      model.questionId,
      model.answerHash,
    );
  }

  async findByUserId(userId: string): Promise<UserQuestion[]> {
    const models = await this.userQuestionModel.findAll({
      where: { userId },
    });
    return models.map((m) => this.toDomain(m));
  }

  async save(userQuestion: UserQuestion): Promise<void> {
    await this.userQuestionModel.upsert({
      id: userQuestion.id,
      userId: userQuestion.userId,
      questionId: userQuestion.questionId,
      answerHash: userQuestion.answerHash,
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.userQuestionModel.destroy({ where: { userId } });
  }
}
