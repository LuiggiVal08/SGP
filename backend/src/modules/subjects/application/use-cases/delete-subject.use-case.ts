import { Injectable, Inject } from '@nestjs/common';
import { ISubjectRepository } from '../../domain/ports/ISubjectRepository';

@Injectable()
export class DeleteSubjectUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepository: ISubjectRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.subjectRepository.delete(id);
  }
}
