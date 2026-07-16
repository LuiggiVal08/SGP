import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { DefenseModel } from '@modules/defenses/infrastructure/persistence/sequelize/models/defense.model';
import { ProfessorModel } from '@modules/professors/infrastructure/persistence/sequelize/models/professor.model';
import { CommunityTutorModel } from '@modules/community-tutors/infrastructure/persistence/sequelize/models/community-tutor.model';

interface DefenseJudgeAttributes {
  id: string;
  defenseId: string;
  judgeType: string;
  professorId: string | null;
  communityTutorId: string | null;
  score: number | null;
}

type DefenseJudgeCreationAttributes = Optional<
  DefenseJudgeAttributes,
  'id' | 'score'
>;

@Table({ tableName: 'defense_judges', timestamps: true })
export class DefenseJudgeModel extends Model<
  DefenseJudgeAttributes,
  DefenseJudgeCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => DefenseModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare defenseId: string;

  @BelongsTo(() => DefenseModel)
  declare defense?: DefenseModel;

  @Column({ type: DataType.STRING(30), allowNull: false })
  declare judgeType: string;

  @ForeignKey(() => ProfessorModel)
  @Column({ type: DataType.UUID, allowNull: true, unique: 'defense_professor' })
  declare professorId: string | null;

  @BelongsTo(() => ProfessorModel)
  declare professor?: ProfessorModel;

  @ForeignKey(() => CommunityTutorModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    unique: 'defense_community_tutor',
  })
  declare communityTutorId: string | null;

  @BelongsTo(() => CommunityTutorModel)
  declare communityTutor?: CommunityTutorModel;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare score: number | null;
}
