import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPermissionRepository } from '../../domain/ports/IPermissionRepository';

@Injectable()
export class CreatePermissionUseCase {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(data: { name: string; description?: string | null }) {
    const existing = await this.permissionRepository.findByName(data.name);
    if (existing) throw new NotFoundException('PERMISSION_NAME_EXISTS');
    return this.permissionRepository.create(data);
  }
}

@Injectable()
export class UpdatePermissionUseCase {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(
    id: string,
    data: { name?: string; description?: string | null },
  ) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) throw new NotFoundException('PERMISSION_NOT_FOUND');
    if (data.name !== undefined) {
      const clash = await this.permissionRepository.findByName(data.name);
      if (clash && clash.id !== id)
        throw new NotFoundException('PERMISSION_NAME_EXISTS');
    }
    return this.permissionRepository.update(id, data);
  }
}

@Injectable()
export class DeletePermissionUseCase {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(id: string) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) throw new NotFoundException('PERMISSION_NOT_FOUND');
    return this.permissionRepository.delete(id);
  }
}

@Injectable()
export class GetPermissionUseCase {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(id: string) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) throw new NotFoundException('PERMISSION_NOT_FOUND');
    return permission;
  }
}

@Injectable()
export class ListPermissionsUseCase {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute() {
    return this.permissionRepository.findAll();
  }
}
