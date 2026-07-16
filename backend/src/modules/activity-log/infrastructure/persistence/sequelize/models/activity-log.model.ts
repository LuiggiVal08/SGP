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

interface ActivityLogAttributes {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string | null;
  details: Record<string, any> | null;
  createdAt: Date;
}

type ActivityLogCreationAttributes = Optional<
  ActivityLogAttributes,
  'id' | 'entityId' | 'description' | 'details' | 'createdAt'
>;

@Table({ tableName: 'activity_logs', timestamps: true, updatedAt: false })
export class ActivityLogModel extends Model<
  ActivityLogAttributes,
  ActivityLogCreationAttributes
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

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare action: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare entityType: string;

  @Column({ type: DataType.UUID, allowNull: true })
  declare entityId: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.JSON, allowNull: true })
  declare details: Record<string, any> | null;

  @Column({ type: DataType.DATE, allowNull: false })
  declare createdAt: Date;
}
