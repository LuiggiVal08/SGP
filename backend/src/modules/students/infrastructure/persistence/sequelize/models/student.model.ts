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

interface StudentAttributes {
  id: string;
  userId: string;
  enrollmentNumber: string;
  cohort: number;
  currentTrayecto: number;
}

type StudentCreationAttributes = Optional<StudentAttributes, 'id'>;

@Table({ tableName: 'students', timestamps: true })
export class StudentModel extends Model<
  StudentAttributes,
  StudentCreationAttributes
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

  @Column({ type: DataType.STRING(30), allowNull: false, unique: true })
  declare enrollmentNumber: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare cohort: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare currentTrayecto: number;
}
