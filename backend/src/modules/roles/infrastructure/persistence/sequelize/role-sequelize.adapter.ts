import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IRoleRepository } from '../../../domain/ports/IRoleRepository';
import { RoleModel } from './models/role.model';
import { Role } from '../../../domain/entities/Role';

@Injectable()
export class RoleSequelizeAdapter implements IRoleRepository {
  constructor(
    @InjectModel(RoleModel)
    private readonly roleModel: typeof RoleModel,
  ) {}

  private toDomain(model: RoleModel | null): Role | null {
    if (!model) return null;
    return new Role(model.id, model.name, model.description);
  }

  async findById(id: string): Promise<Role | null> {
    const role = await this.roleModel.findByPk(id);
    return this.toDomain(role);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.roleModel.findOne({ where: { name } });
    return this.toDomain(role);
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.roleModel.findAll();
    return roles.map((r) => new Role(r.id, r.name, r.description));
  }

  async save(role: Role): Promise<void> {
    await this.roleModel.upsert({
      id: role.id,
      name: role.name,
      description: role.description,
    });
  }
}
