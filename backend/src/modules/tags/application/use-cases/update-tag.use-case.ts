import { Injectable, Inject } from '@nestjs/common';
import { ITagRepository } from '../../domain/ports/ITagRepository';
import { Tag } from '../../domain/entities/Tag';

@Injectable()
export class UpdateTagUseCase {
  constructor(
    @Inject('ITagRepository')
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(id: string, data: { name?: string; category?: string }) {
    const existing = await this.tagRepository.findById(id);
    if (!existing) {
      throw new Error('TAG_NOT_FOUND');
    }
    const updated = new Tag(
      existing.id,
      data.name ?? existing.name,
      data.category ?? existing.category,
    );
    await this.tagRepository.save(updated);
    return updated;
  }
}
