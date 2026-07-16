import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IPnfRepository } from '../../domain/ports/IPnfRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';

@Injectable()
export class DeletePnfUseCase {
  constructor(
    @Inject('IPnfRepository')
    private readonly pnfRepository: IPnfRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
    @Inject('IUserRepository')
    private readonly userRepository: {
      countByPnfId: (id: string) => Promise<number>;
    },
    @Inject('IProjectRepository')
    private readonly projectRepository: {
      countByPnfId: (id: string) => Promise<number>;
    },
  ) {}

  async execute(id: string): Promise<void> {
    const pnf = await this.pnfRepository.findById(id);
    if (!pnf) {
      throw new NotFoundException('PNF no encontrada');
    }

    const userCount = await this.userRepository.countByPnfId(id);
    const projectCount = await this.projectRepository.countByPnfId(id);

    const reasons: string[] = [];
    if (userCount > 0) {
      reasons.push(
        `${userCount} usuario${userCount === 1 ? '' : 's'} asociado${userCount === 1 ? '' : 's'}`,
      );
    }
    if (projectCount > 0) {
      reasons.push(
        `${projectCount} proyecto${projectCount === 1 ? '' : 's'} asociado${projectCount === 1 ? '' : 's'}`,
      );
    }

    if (reasons.length > 0) {
      throw new ConflictException(
        `La PNF no puede eliminarse porque tiene ${reasons.join(' y ')}`,
      );
    }

    await this.pnfRepository.delete(id);
    await this.cacheService.delete('catalogs:pnf');
  }
}
