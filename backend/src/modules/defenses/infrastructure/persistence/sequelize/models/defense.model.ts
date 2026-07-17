import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ProjectModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project.model';

interface DefenseAttributes {
  id: string;
  projectId: string;
  scheduledDate: Date;
  actualDate: Date | null;
  status: string;
}

type DefenseCreationAttributes = Optional<
  DefenseAttributes,
  'id' | 'actualDate' | 'status'
>;

@Table({ tableName: 'defenses', timestamps: true })
export class DefenseModel extends Model<
  DefenseAttributes,
  DefenseCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  declare projectId: string;

  @BelongsTo(() => ProjectModel)
  declare project?: ProjectModel;

  @Column({ type: DataType.DATE, allowNull: true })
  declare scheduledDate: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare actualDate: Date | null;

  @Column({
    type: DataType.STRING(30),
    allowNull: true,
    defaultValue: 'PROGRAMADA',
  })
  declare status: string;
}
