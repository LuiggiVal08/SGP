import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';
import { QuestionModel } from './question.model';

interface UserQuestionAttributes {
  id: string;
  userId: string;
  questionId: string;
  answerHash: string;
}

type UserQuestionCreationAttributes = Optional<UserQuestionAttributes, 'id'>;

@Table({ tableName: 'user_questions', timestamps: true })
export class UserQuestionModel extends Model<
  UserQuestionAttributes,
  UserQuestionCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @ForeignKey(() => QuestionModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare questionId: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare answerHash: string;
}
