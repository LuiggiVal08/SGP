import { Injectable, Inject } from '@nestjs/common';
import { IQuestionRepository } from '../../domain/ports/IQuestionRepository';
import { Question } from '../../domain/entities/Question';

@Injectable()
export class GetQuestionsUseCase {
  constructor(
    @Inject('IQuestionRepository')
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(): Promise<Question[]> {
    return this.questionRepository.findActive();
  }
}
