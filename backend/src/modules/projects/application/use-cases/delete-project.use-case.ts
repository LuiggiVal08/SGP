import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(id: string): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const fileCount = await this.projectRepository.countFiles(id);
    if (fileCount > 0) {
      throw new ConflictException(
        'No se puede eliminar un proyecto con archivos asociados',
      );
    }

    await this.projectRepository.delete(id);
    await this.cacheService.delete('projects:all');
  }
}
