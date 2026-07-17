import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { Optional } from 'sequelize';

interface QuestionAttributes {
  id: string;
  questionText: string;
  active: boolean;
}

type QuestionCreationAttributes = Optional<QuestionAttributes, 'id' | 'active'>;

@Table({ tableName: 'questions', timestamps: true })
export class QuestionModel extends Model<
  QuestionAttributes,
  QuestionCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare questionText: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare active: boolean;
}
