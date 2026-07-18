import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';

interface UserTokenAttributes {
  id: string;
  userId: string;
  token: string;
  type: string;
  used: boolean;
  expiration: Date;
  createdAt: Date;
}

type UserTokenCreationAttributes = Optional<
  UserTokenAttributes,
  'id' | 'used' | 'createdAt'
>;

@Table({
  tableName: 'user_tokens',
  timestamps: false,
})
export class UserTokenModel extends Model<
  UserTokenAttributes,
  UserTokenCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;

  @Column({ type: DataType.STRING(255), unique: true, allowNull: false })
  declare token: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  declare type: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare used: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  declare expiration: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;
}
