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

interface ProfessorAttributes {
  id: string;
  userId: string;
  specialization: string | null;
}

type ProfessorCreationAttributes = Optional<
  ProfessorAttributes,
  'id' | 'specialization'
>;

@Table({ tableName: 'professors', timestamps: true })
export class ProfessorModel extends Model<
  ProfessorAttributes,
  ProfessorCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  declare userId: string;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare specialization: string | null;
}
