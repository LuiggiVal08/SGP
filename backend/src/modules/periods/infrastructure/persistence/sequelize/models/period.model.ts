import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { Optional } from 'sequelize';

interface PeriodAttributes {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

type PeriodCreationAttributes = Optional<PeriodAttributes, 'id' | 'isActive'>;

@Table({ tableName: 'periods', timestamps: true })
export class PeriodModel extends Model<
  PeriodAttributes,
  PeriodCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare startDate: Date;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare endDate: Date;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;
}
