import { Injectable, Inject } from '@nestjs/common';
import { ICommunityPlaceRepository } from '../../domain/ports/ICommunityPlaceRepository';

@Injectable()
export class GetAllCommunityPlacesUseCase {
  constructor(
    @Inject('ICommunityPlaceRepository')
    private readonly communityPlaceRepository: ICommunityPlaceRepository,
  ) {}

  async execute(dto: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<any> {
    return this.communityPlaceRepository.findAllPaginated(dto);
  }
}
