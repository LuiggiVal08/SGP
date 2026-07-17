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

interface NotificationAttributes {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  entityType: string | null;
  entityId: string | null;
  readAt: Date | null;
  createdAt: Date;
}

type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  'id' | 'entityType' | 'entityId' | 'readAt' | 'createdAt'
>;

@Table({ tableName: 'notifications', timestamps: true, updatedAt: false })
export class NotificationModel extends Model<
  NotificationAttributes,
  NotificationCreationAttributes
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

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare message: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare type: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare entityType: string | null;

  @Column({ type: DataType.UUID, allowNull: true })
  declare entityId: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare readAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: false })
  declare createdAt: Date;
}
