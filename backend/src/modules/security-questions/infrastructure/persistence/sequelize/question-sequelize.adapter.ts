import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IQuestionRepository } from '../../../domain/ports/IQuestionRepository';
import { QuestionModel } from './models/question.model';
import { Question } from '../../../domain/entities/Question';

@Injectable()
export class QuestionSequelizeAdapter implements IQuestionRepository {
  constructor(
    @InjectModel(QuestionModel)
    private readonly questionModel: typeof QuestionModel,
  ) {}

  private toDomain(model: QuestionModel): Question {
    return new Question(model.id, model.questionText, model.active);
  }

  async findAll(): Promise<Question[]> {
    const models = await this.questionModel.findAll();
    return models.map((m) => this.toDomain(m));
  }

  async findActive(): Promise<Question[]> {
    const models = await this.questionModel.findAll({
      where: { active: true },
    });
    return models.map((m) => this.toDomain(m));
  }

  async findById(id: string): Promise<Question | null> {
    const model = await this.questionModel.findByPk(id);
    return model ? this.toDomain(model) : null;
  }
}
