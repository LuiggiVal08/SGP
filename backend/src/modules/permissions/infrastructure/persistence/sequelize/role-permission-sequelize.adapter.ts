import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IRolePermissionRepository } from '../../../domain/ports/IRolePermissionRepository';
import { RolePermissionModel } from './models/role-permission.model';
import { PermissionModel } from './models/permission.model';
import { Permission } from '../../../domain/entities/Permission';

@Injectable()
export class RolePermissionSequelizeAdapter implements IRolePermissionRepository {
  constructor(
    @InjectModel(RolePermissionModel)
    private readonly rolePermissionModel: typeof RolePermissionModel,
    @InjectModel(PermissionModel)
    private readonly permissionModel: typeof PermissionModel,
  ) {}

  async assign(roleId: string, permissionId: string): Promise<void> {
    await this.rolePermissionModel.findOrCreate({
      where: { roleId, permissionId },
      defaults: { roleId, permissionId },
    });
  }

  async remove(roleId: string, permissionId: string): Promise<void> {
    await this.rolePermissionModel.destroy({ where: { roleId, permissionId } });
  }

  async findPermissionsByRoleId(roleId: string): Promise<Permission[]> {
    const rows = await this.permissionModel.findAll({
      include: [
        {
          model: RolePermissionModel,
          where: { roleId },
          attributes: [],
          required: true,
        },
      ],
    });
    return rows.map((r) => new Permission(r.id, r.name, r.description ?? null));
  }

  async findByRoleId(
    roleId: string,
  ): Promise<{ roleId: string; permissionId: string }[]> {
    const rows = await this.rolePermissionModel.findAll({ where: { roleId } });
    return rows.map((r) => ({
      roleId: r.roleId,
      permissionId: r.permissionId,
    }));
  }
}
