import { Injectable, Inject } from '@nestjs/common';
import { ITagRepository } from '../../domain/ports/ITagRepository';

@Injectable()
export class DeleteTagUseCase {
  constructor(
    @Inject('ITagRepository')
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.tagRepository.delete(id);
  }
}
