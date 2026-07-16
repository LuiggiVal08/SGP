import { Injectable, Inject } from '@nestjs/common';
import { ITagRepository } from '../../domain/ports/ITagRepository';

@Injectable()
export class GetAllTagsUseCase {
  constructor(
    @Inject('ITagRepository')
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(dto: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<any> {
    return this.tagRepository.findAllPaginated(dto);
  }
}
