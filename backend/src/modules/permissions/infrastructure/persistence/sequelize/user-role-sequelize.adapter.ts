import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IUserRoleRepository } from '../../../domain/ports/IUserRoleRepository';
import { UserRoleModel } from './models/user-role.model';

@Injectable()
export class UserRoleSequelizeAdapter implements IUserRoleRepository {
  constructor(
    @InjectModel(UserRoleModel)
    private readonly userRoleModel: typeof UserRoleModel,
  ) {}

  async assign(userId: string, roleId: string): Promise<void> {
    await this.userRoleModel.findOrCreate({
      where: { userId, roleId },
      defaults: { userId, roleId },
    });
  }

  async remove(userId: string, roleId: string): Promise<void> {
    await this.userRoleModel.destroy({ where: { userId, roleId } });
  }

  async findRoleIdsByUserId(userId: string): Promise<string[]> {
    const rows = await this.userRoleModel.findAll({ where: { userId } });
    return rows.map((r) => r.roleId);
  }
}
