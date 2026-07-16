import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { PnfModel } from '@modules/pnf/infrastructure/persistence/sequelize/models/pnf.model';

interface TrajectoryAttributes {
  id: string;
  pnfId: string;
  name: string;
  orderNumber: number;
}

type TrajectoryCreationAttributes = Optional<TrajectoryAttributes, 'id'>;

@Table({ tableName: 'trajectories', timestamps: true })
export class TrajectoryModel extends Model<
  TrajectoryAttributes,
  TrajectoryCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => PnfModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare pnfId: string;

  @BelongsTo(() => PnfModel)
  declare pnf?: PnfModel;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare orderNumber: number;
}
