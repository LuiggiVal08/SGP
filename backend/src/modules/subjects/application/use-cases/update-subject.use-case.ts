import { Injectable, Inject } from '@nestjs/common';
import { ISubjectRepository } from '../../domain/ports/ISubjectRepository';
import { Subject } from '../../domain/entities/Subject';

@Injectable()
export class UpdateSubjectUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepository: ISubjectRepository,
  ) {}

  async execute(id: string, data: { trajectoryId?: string; name?: string }) {
    const existing = await this.subjectRepository.findById(id);
    if (!existing) {
      throw new Error('SUBJECT_NOT_FOUND');
    }
    const updated = new Subject(
      existing.id,
      data.trajectoryId ?? existing.trajectoryId,
      data.name ?? existing.name,
    );
    await this.subjectRepository.save(updated);
    return updated;
  }
}
