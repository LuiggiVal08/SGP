import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IPermissionRepository } from '../../../domain/ports/IPermissionRepository';
import { PermissionModel } from './models/permission.model';
import { Permission } from '../../../domain/entities/Permission';

@Injectable()
export class PermissionSequelizeAdapter implements IPermissionRepository {
  constructor(
    @InjectModel(PermissionModel)
    private readonly permissionModel: typeof PermissionModel,
  ) {}

  private toDomain(model: PermissionModel | null): Permission | null {
    if (!model) return null;
    return new Permission(model.id, model.name, model.description ?? null);
  }

  async findAll(): Promise<Permission[]> {
    const rows = await this.permissionModel.findAll();
    return rows.map((r) => new Permission(r.id, r.name, r.description ?? null));
  }

  async findById(id: string): Promise<Permission | null> {
    const row = await this.permissionModel.findByPk(id);
    return this.toDomain(row);
  }

  async findByName(name: string): Promise<Permission | null> {
    const row = await this.permissionModel.findOne({ where: { name } });
    return this.toDomain(row);
  }

  async create(data: {
    name: string;
    description?: string | null;
  }): Promise<Permission> {
    const row = await this.permissionModel.create({
      name: data.name,
      description: data.description ?? null,
    });
    return new Permission(row.id, row.name, row.description ?? null);
  }

  async update(
    id: string,
    data: { name?: string; description?: string | null },
  ): Promise<Permission> {
    const row = await this.permissionModel.findByPk(id);
    if (!row) throw new Error('PERMISSION_NOT_FOUND');
    if (data.name !== undefined) row.name = data.name;
    if (data.description !== undefined) row.description = data.description;
    await row.save();
    return new Permission(row.id, row.name, row.description ?? null);
  }

  async delete(id: string): Promise<void> {
    await this.permissionModel.destroy({ where: { id } });
  }
}
