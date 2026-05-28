import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { RoleModel } from '@modules/roles/infrastructure/persistence/sequelize/models/role.model';
import { CareerModel } from '@modules/careers/infrastructure/persistence/sequelize/models/career.model';
import { InstitutionModel } from '@modules/institutions/infrastructure/persistence/sequelize/models/institution.model';

interface UserAttributes {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  careerId: string;
  institutionId: string;
  roleId: string;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'isActive'>;

@Table({ tableName: 'users', timestamps: true })
export class UserModel extends Model<UserAttributes, UserCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(20), unique: true, allowNull: false })
  declare dni: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare firstName: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare lastName: string;

  @Column({ type: DataType.STRING(100), unique: true, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare password: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isActive: boolean;

  @ForeignKey(() => CareerModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare careerId: string;

  @BelongsTo(() => CareerModel)
  declare career?: CareerModel;

  @ForeignKey(() => InstitutionModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare institutionId: string;

  @BelongsTo(() => InstitutionModel)
  declare institution?: InstitutionModel;

  @ForeignKey(() => RoleModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare roleId: string;

  @BelongsTo(() => RoleModel)
  declare role?: RoleModel;
}
