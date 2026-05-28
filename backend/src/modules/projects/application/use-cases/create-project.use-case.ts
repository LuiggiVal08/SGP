import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICareerRepository } from '../../../careers/domain/ports/ICareerRepository';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { Project } from '../../domain/entities/Project';
import { randomUUID } from 'crypto';

interface CreateProjectInput {
  title: string;
  year: number;
  careerId: string;
  authorIds: string[];
  tutorId: string;
}

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ICareerRepository')
    private readonly careerRepository: ICareerRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(input: CreateProjectInput) {
    if (input.authorIds.length > 3) {
      throw new BadRequestException('Maximum 3 authors per project');
    }

    const career = await this.careerRepository.findById(input.careerId);
    if (!career) {
      throw new BadRequestException('Career not found');
    }

    const tutor = await this.userRepository.findById(input.tutorId);
    if (!tutor) {
      throw new BadRequestException('Tutor not found');
    }

    for (const authorId of input.authorIds) {
      const author = await this.userRepository.findById(authorId);
      if (!author) {
        throw new BadRequestException(`Author with id ${authorId} not found`);
      }
    }

    const project = new Project(
      randomUUID(),
      input.title,
      input.year,
      'PENDING_VALIDATION',
      input.careerId,
      input.tutorId,
    );

    const result = await this.projectRepository.save(project, input.authorIds);
    await this.cacheService.delete('projects:all');
    return result;
  }
}
