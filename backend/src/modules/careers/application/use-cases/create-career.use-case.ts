import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ICareerRepository } from '../../domain/ports/ICareerRepository';
import { Career } from '../../domain/entities/Career';

@Injectable()
export class CreateCareerUseCase {
  constructor(
    @Inject('ICareerRepository')
    private readonly careerRepository: ICareerRepository,
  ) {}

  async execute(name: string) {
    const career = new Career(randomUUID(), name);
    await this.careerRepository.save(career);
    return career;
  }
}
