// src/modules/users/infrastructure/adapters/user-sequelize.adapter.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { UserModel } from '../persistence/user.model';
import { User } from '../../domain/entities/User';

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
      model.firstName,
      model.lastName,
      model.dni,
      model.username,
      model.email,
      model.password,
      model.isActive,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { email } });
    return this.toDomain(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { username } });
    return this.toDomain(user);
  }

  async findByDni(dni: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { dni } });
    return this.toDomain(user);
  }

  async save(user: User): Promise<void> {
    await this.userModel.upsert({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      dni: user.dni,
      username: user.username,
      email: user.email,
      password: user.passwordHash,
      isActive: user.isActive,
    });
  }
}
