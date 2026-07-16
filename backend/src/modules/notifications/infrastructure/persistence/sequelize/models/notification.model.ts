import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { Optional } from 'sequelize';

interface NotificationAttributes {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  relatedId: string | null;
  createdAt: Date;
}

type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  'id' | 'read' | 'relatedId' | 'createdAt'
>;

@Table({ tableName: 'notifications', timestamps: false })
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

  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare message: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  declare type: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare read: boolean;

  @Column({ type: DataType.STRING(36), allowNull: true })
  declare relatedId: string | null;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare createdAt: Date;
}
