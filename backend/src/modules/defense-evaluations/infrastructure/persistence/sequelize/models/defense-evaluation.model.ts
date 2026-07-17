import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { DefenseJudgeModel } from '@modules/defense-judges/infrastructure/persistence/sequelize/models/defense-judge.model';

interface DefenseEvaluationAttributes {
  id: string;
  judgeId: string;
  score: number;
  comments: string;
}

type DefenseEvaluationCreationAttributes = Optional<
  DefenseEvaluationAttributes,
  'id'
>;

@Table({ tableName: 'defense_evaluations', timestamps: true })
export class DefenseEvaluationModel extends Model<
  DefenseEvaluationAttributes,
  DefenseEvaluationCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => DefenseJudgeModel)
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  declare judgeId: string;

  @BelongsTo(() => DefenseJudgeModel)
  declare judge?: DefenseJudgeModel;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  declare score: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare comments: string;
}
