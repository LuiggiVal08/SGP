import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICareerRepository } from '../../domain/ports/ICareerRepository';
import { Career } from '../../domain/entities/Career';

@Injectable()
export class UpdateCareerUseCase {
  constructor(
    @Inject('ICareerRepository')
    private readonly careerRepository: ICareerRepository,
  ) {}

  async execute(id: string, name: string) {
    const existing = await this.careerRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Career not found');
    }
    const career = new Career(id, name);
    await this.careerRepository.save(career);
    return career;
  }
}
