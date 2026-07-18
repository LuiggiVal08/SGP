import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateUserTokenInput,
  IUserTokenRepository,
} from '../../../domain/ports/IUserTokenRepository';
import { UserToken, UserTokenType } from '../../../domain/entities/UserToken';
import { UserTokenModel } from './models/user-token.model';

@Injectable()
export class UserTokenSequelizeAdapter implements IUserTokenRepository {
  constructor(
    @InjectModel(UserTokenModel)
    private readonly userTokenModel: typeof UserTokenModel,
  ) {}

  private toDomain(model: UserTokenModel): UserToken {
    return new UserToken(
      model.id,
      model.userId,
      model.token,
      model.type as UserTokenType,
      model.used,
      model.expiration,
      model.createdAt,
    );
  }

  async create(input: CreateUserTokenInput): Promise<UserToken> {
    const created = await this.userTokenModel.create({
      userId: input.userId,
      token: input.token,
      type: input.type,
      expiration: input.expiration,
      used: false,
    });
    return this.toDomain(created);
  }

  async findByToken(token: string): Promise<UserToken | null> {
    const model = await this.userTokenModel.findOne({ where: { token } });
    return model ? this.toDomain(model) : null;
  }

  async markUsed(id: string): Promise<void> {
    await this.userTokenModel.update({ used: true }, { where: { id } });
  }
}
