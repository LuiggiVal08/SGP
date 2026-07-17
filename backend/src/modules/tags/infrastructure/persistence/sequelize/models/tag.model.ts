import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { Optional } from 'sequelize';

interface TagAttributes {
  id: string;
  name: string;
  category: string;
}

type TagCreationAttributes = Optional<TagAttributes, 'id'>;

@Table({ tableName: 'tags', timestamps: true })
export class TagModel extends Model<TagAttributes, TagCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare category: string;
}
