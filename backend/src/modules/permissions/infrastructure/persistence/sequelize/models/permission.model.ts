import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { Optional } from 'sequelize';

interface PermissionAttributes {
  id: string;
  name: string;
  description: string | null;
}

type PermissionCreationAttributes = Optional<
  PermissionAttributes,
  'id' | 'description'
>;

@Table({ tableName: 'permissions', timestamps: true })
export class PermissionModel extends Model<
  PermissionAttributes,
  PermissionCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(100), unique: true, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare description: string | null;
}
