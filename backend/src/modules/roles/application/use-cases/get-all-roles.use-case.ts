import { Injectable, Inject } from '@nestjs/common';
import { IRoleRepository } from '../../domain/ports/IRoleRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';

@Injectable()
export class GetAllRolesUseCase {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(): Promise<any> {
    const cached = await this.cacheService.get('catalogs:roles');
    if (cached) return JSON.parse(cached);

    const roles = await this.roleRepository.findAll();
    await this.cacheService.set('catalogs:roles', JSON.stringify(roles), 86400);
    return roles;
  }
}
