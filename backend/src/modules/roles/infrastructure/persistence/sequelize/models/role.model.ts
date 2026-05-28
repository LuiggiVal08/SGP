import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';

interface RoleAttributes {
  id: string;
  name: string;
  description: string;
}

type RoleCreationAttributes = Optional<RoleAttributes, 'id'>;

@Table({ tableName: 'roles', timestamps: true })
export class RoleModel extends Model<RoleAttributes, RoleCreationAttributes> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(20), unique: true, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare description: string;

  @HasMany(() => UserModel)
  declare users?: UserModel[];
}
