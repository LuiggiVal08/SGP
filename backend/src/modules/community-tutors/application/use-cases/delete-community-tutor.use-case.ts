import { Injectable, Inject } from '@nestjs/common';
import { ICommunityTutorRepository } from '../../domain/ports/ICommunityTutorRepository';

@Injectable()
export class DeleteCommunityTutorUseCase {
  constructor(
    @Inject('ICommunityTutorRepository')
    private readonly communityTutorRepository: ICommunityTutorRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.communityTutorRepository.delete(id);
  }
}
