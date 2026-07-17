import { Injectable, Inject } from '@nestjs/common';
import { ICommunityTutorRepository } from '../../domain/ports/ICommunityTutorRepository';

@Injectable()
export class GetAllCommunityTutorsUseCase {
  constructor(
    @Inject('ICommunityTutorRepository')
    private readonly communityTutorRepository: ICommunityTutorRepository,
  ) {}

  async execute(dto: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<any> {
    return this.communityTutorRepository.findAllPaginated(dto);
  }
}
