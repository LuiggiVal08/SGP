import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { IPnfRepository } from '../../../pnf/domain/ports/IPnfRepository';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { CommunityTutorData } from '../../domain/entities/Project';

interface UpdateProjectInput {
  id: string;
  title?: string;
  year?: number;
  pnfId?: string;
  authorIds?: string[];
  tutorId?: string;
  isExceptional?: boolean;
  communityTutor?: CommunityTutorData;
  methodology?: string | null;
}

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IPnfRepository')
    private readonly pnfRepository: IPnfRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(input: UpdateProjectInput) {
    const project = await this.projectRepository.findById(input.id);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const maxAuthors = input.isExceptional ? 5 : 3;
    if (input.authorIds && input.authorIds.length > maxAuthors) {
      throw new BadRequestException(
        `Máximo ${maxAuthors} autores por proyecto`,
      );
    }

    if (input.pnfId) {
      const pnf = await this.pnfRepository.findById(input.pnfId);
      if (!pnf) {
        throw new BadRequestException('PNF no encontrada');
      }
    }

    if (input.tutorId) {
      const tutor = await this.userRepository.findById(input.tutorId);
      if (!tutor) {
        throw new BadRequestException('Tutor no encontrado');
      }
    }

    if (input.authorIds) {
      for (const authorId of input.authorIds) {
        const author = await this.userRepository.findById(authorId);
        if (!author) {
          throw new BadRequestException(
            `Autor con id ${authorId} no encontrado`,
          );
        }
      }
    }

    const updateData: Parameters<IProjectRepository['update']>[1] = {
      title: input.title,
      year: input.year,
      pnfId: input.pnfId,
      tutorId: input.tutorId,
      authorIds: input.authorIds,
    };

    if (input.communityTutor !== undefined) {
      updateData.communityTutor = input.communityTutor || null;
    }
    if (input.methodology !== undefined) {
      updateData.methodology = input.methodology;
    }

    const result = await this.projectRepository.update(input.id, updateData);
    await this.cacheService.delete('projects:all');
    return result;
  }
}
