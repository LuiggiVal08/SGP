import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';

@Injectable()
export class GenerateCartaCulminacionUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  execute(_projectId: string) {
    throw new NotFoundException(
      'Carta culminacion — pending full rebuild (s-d-assign)',
    );
  }
}
