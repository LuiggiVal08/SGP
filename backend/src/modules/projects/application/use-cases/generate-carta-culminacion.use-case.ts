import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { CartaCulminacionData } from '../../domain/entities/Project';
import { CartaPdfService } from '../../infrastructure/services/carta-pdf.service';
import { IFileStorageService } from '@share/domain/ports/IFileStorageService';
import { randomUUID } from 'crypto';

@Injectable()
export class GenerateCartaCulminacionUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    private readonly cartaPdfService: CartaPdfService,
    @Inject('IFileStorageService')
    private readonly storageService: IFileStorageService,
  ) {}

  async execute(projectId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const existing =
      await this.projectRepository.findCartasByProject(projectId);
    if (existing.length > 0 && existing.every((c) => c.pdfUrl)) {
      return existing;
    }
    if (existing.length > 0) {
      await this.projectRepository.deleteCartasByProject(projectId);
    }

    if (!project.authors || project.authors.length === 0) {
      throw new NotFoundException('El proyecto no tiene autores');
    }

    const tutorName = project.tutor
      ? `${project.tutor.firstName} ${project.tutor.lastName}`
      : 'No asignado';

    const pnfName = project.pnf?.name ?? 'PNF';

    const cartas: CartaCulminacionData[] = [];
    for (const author of project.authors) {
      const authorName = `${author.firstName} ${author.lastName}`;

      const pdfBuffer = await this.cartaPdfService.generate({
        authorName,
        projectTitle: project.title,
        tutorName,
        pnfName,
        year: project.year,
        defensaDate: project.defensaDate,
      });

      const sanitizedName = authorName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const { url } = await this.storageService.upload(pdfBuffer, {
        originalName: `carta-culminacion-${sanitizedName}.pdf`,
        mimeType: 'application/pdf',
        directory: `cartas/${projectId}`,
      });

      const carta = await this.projectRepository.createCarta({
        id: randomUUID(),
        projectId,
        userId: author.id,
        pdfUrl: url,
      });
      cartas.push(carta);
    }

    return cartas;
  }
}
