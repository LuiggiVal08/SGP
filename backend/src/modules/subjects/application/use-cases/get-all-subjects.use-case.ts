import { Injectable, Inject } from '@nestjs/common';
import { ISubjectRepository } from '../../domain/ports/ISubjectRepository';

@Injectable()
export class GetAllSubjectsUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepository: ISubjectRepository,
  ) {}

  async execute(dto: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<any> {
    return this.subjectRepository.findAllPaginated(dto);
  }
}
