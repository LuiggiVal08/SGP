import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ITagRepository } from '../../domain/ports/ITagRepository';
import { Tag } from '../../domain/entities/Tag';

@Injectable()
export class CreateTagUseCase {
  constructor(
    @Inject('ITagRepository')
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(data: { name: string; category: string }) {
    const tag = new Tag(randomUUID(), data.name, data.category);
    await this.tagRepository.save(tag);
    return tag;
  }
}
