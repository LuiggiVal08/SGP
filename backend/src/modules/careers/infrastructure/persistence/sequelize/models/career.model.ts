import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { Optional } from 'sequelize';

interface CareerAttributes {
  id: string;
  name: string;
}

type CareerCreationAttributes = Optional<CareerAttributes, 'id'>;

@Table({ tableName: 'careers', timestamps: true })
export class CareerModel extends Model<
  CareerAttributes,
  CareerCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;
}
