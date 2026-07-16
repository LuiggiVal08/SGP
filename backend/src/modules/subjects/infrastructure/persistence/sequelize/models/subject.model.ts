import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { TrajectoryModel } from '@modules/trajectories/infrastructure/persistence/sequelize/models/trajectory.model';

interface SubjectAttributes {
  id: string;
  trajectoryId: string;
  name: string;
}

type SubjectCreationAttributes = Optional<SubjectAttributes, 'id'>;

@Table({ tableName: 'subjects', timestamps: true })
export class SubjectModel extends Model<
  SubjectAttributes,
  SubjectCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => TrajectoryModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare trajectoryId: string;

  @BelongsTo(() => TrajectoryModel)
  declare trajectory?: TrajectoryModel;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;
}
