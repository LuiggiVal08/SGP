import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ISubjectRepository } from '../../domain/ports/ISubjectRepository';
import { Subject } from '../../domain/entities/Subject';

@Injectable()
export class CreateSubjectUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepository: ISubjectRepository,
  ) {}

  async execute(data: { trajectoryId: string; name: string }) {
    const subject = new Subject(randomUUID(), data.trajectoryId, data.name);
    await this.subjectRepository.save(subject);
    return subject;
  }
}
