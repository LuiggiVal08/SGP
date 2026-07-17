import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { DefenseModel } from './defense.model';

interface DefenseScheduleChangeAttributes {
  id: string;
  defenseId: string;
  previousDate: Date | null;
  newDate: Date;
  changedBy: string;
  reason: string | null;
  createdAt: Date;
}

type DefenseScheduleChangeCreationAttributes = Optional<
  DefenseScheduleChangeAttributes,
  'id' | 'createdAt'
>;

@Table({ tableName: 'defense_schedule_changes', timestamps: false })
export class DefenseScheduleChangeModel extends Model<
  DefenseScheduleChangeAttributes,
  DefenseScheduleChangeCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => DefenseModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare defenseId: string;

  @BelongsTo(() => DefenseModel)
  declare defense?: DefenseModel;

  @Column({ type: DataType.DATE, allowNull: true })
  declare previousDate: Date | null;

  @Column({ type: DataType.DATE, allowNull: false })
  declare newDate: Date;

  @Column({ type: DataType.UUID, allowNull: false })
  declare changedBy: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare reason: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare createdAt: Date;
}
