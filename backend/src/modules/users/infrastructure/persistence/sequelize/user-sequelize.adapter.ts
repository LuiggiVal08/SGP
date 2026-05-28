import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { UserModel } from './models/user.model';
import { User } from '../../../domain/entities/User';

@Injectable()
export class UserSequelizeAdapter implements IUserRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {}

  private toDomain(model: UserModel | null): User | null {
    if (!model) return null;
    return new User(
      model.id,
      model.dni,
      model.firstName,
      model.lastName,
      model.email,
      model.password,
      model.isActive,
      model.careerId,
      model.institutionId,
      model.roleId,
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findByPk(id);
    return this.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { email } });
    return this.toDomain(user);
  }

  async findByDni(dni: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { dni } });
    return this.toDomain(user);
  }

  async findByRoleId(roleId: string): Promise<User[]> {
    const users = await this.userModel.findAll({ where: { roleId } });
    return users.map(
      (u) =>
        new User(
          u.id,
          u.dni,
          u.firstName,
          u.lastName,
          u.email,
          u.password,
          u.isActive,
          u.careerId,
          u.institutionId,
          u.roleId,
        ),
    );
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.findAll();
    return users.map(
      (u) =>
        new User(
          u.id,
          u.dni,
          u.firstName,
          u.lastName,
          u.email,
          u.password,
          u.isActive,
          u.careerId,
          u.institutionId,
          u.roleId,
        ),
    );
  }

  async save(user: User): Promise<void> {
    await this.userModel.upsert({
      id: user.id,
      dni: user.dni,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      careerId: user.careerId,
      institutionId: user.institutionId,
      roleId: user.roleId,
    });
  }
}
