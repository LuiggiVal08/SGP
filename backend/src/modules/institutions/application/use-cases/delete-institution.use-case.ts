import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IInstitutionRepository } from '../../domain/ports/IInstitutionRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';

@Injectable()
export class DeleteInstitutionUseCase {
  constructor(
    @Inject('IInstitutionRepository')
    private readonly institutionRepository: IInstitutionRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
    @Inject('IUserRepository')
    private readonly userRepository: {
      countByInstitutionId: (id: string) => Promise<number>;
    },
    @Inject('IPnfRepository')
    private readonly pnfRepository: {
      countByInstitutionId: (id: string) => Promise<number>;
    },
  ) {}

  async execute(id: string): Promise<void> {
    const institution = await this.institutionRepository.findById(id);
    if (!institution) {
      throw new NotFoundException('Institución no encontrada');
    }

    const userCount = await this.userRepository.countByInstitutionId(id);
    if (userCount > 0) {
      throw new ConflictException(
        `La institución no puede eliminarse porque tiene ${userCount} usuario${userCount === 1 ? '' : 's'} asociado${userCount === 1 ? '' : 's'}`,
      );
    }

    const pnfCount = await this.pnfRepository.countByInstitutionId(id);
    if (pnfCount > 0) {
      throw new ConflictException(
        `La institución no puede eliminarse porque tiene ${pnfCount} PNF${pnfCount === 1 ? '' : 's'} asociada${pnfCount === 1 ? '' : 's'}`,
      );
    }

    await this.institutionRepository.delete(id);
    await this.cacheService.delete('catalogs:institutions');
  }
}
