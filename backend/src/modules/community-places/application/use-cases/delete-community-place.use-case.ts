import { Injectable, Inject } from '@nestjs/common';
import { ICommunityPlaceRepository } from '../../domain/ports/ICommunityPlaceRepository';

@Injectable()
export class DeleteCommunityPlaceUseCase {
  constructor(
    @Inject('ICommunityPlaceRepository')
    private readonly communityPlaceRepository: ICommunityPlaceRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.communityPlaceRepository.delete(id);
  }
}
