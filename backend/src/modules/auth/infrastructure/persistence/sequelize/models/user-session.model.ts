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

interface UserSessionAttributes {
  id: string;
  userId: string;
  device: string | null;
  ip: string | null;
  startAt: Date;
  endAt: Date | null;
  active: boolean;
}

type UserSessionCreationAttributes = Optional<
  UserSessionAttributes,
  'id' | 'device' | 'ip' | 'startAt' | 'endAt' | 'active'
>;

@Table({ tableName: 'user_sessions', timestamps: false })
export class UserSessionModel extends Model<
  UserSessionAttributes,
  UserSessionCreationAttributes
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

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare device: string | null;

  @Column({ type: DataType.STRING(45), allowNull: true })
  declare ip: string | null;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare startAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare endAt: Date | null;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare active: boolean;
}
