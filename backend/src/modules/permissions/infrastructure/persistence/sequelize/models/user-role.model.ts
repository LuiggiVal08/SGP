import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({ tableName: 'user_roles', timestamps: false })
export class UserRoleModel extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @PrimaryKey
  @Column({ type: DataType.UUID, allowNull: false })
  declare roleId: string;
}
