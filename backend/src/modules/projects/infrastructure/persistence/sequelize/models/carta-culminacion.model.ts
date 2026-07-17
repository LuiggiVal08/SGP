import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ProjectModel } from './project.model';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';

interface CartaCulminacionAttributes {
  id: string;
  projectId: string;
  userId: string;
  pdfUrl: string | null;
}

type CartaCulminacionCreationAttributes = Optional<
  CartaCulminacionAttributes,
  'id' | 'pdfUrl'
>;

@Table({ tableName: 'carta_culminacion', timestamps: true })
export class CartaCulminacionModel extends Model<
  CartaCulminacionAttributes,
  CartaCulminacionCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare projectId: string;

  @BelongsTo(() => ProjectModel)
  declare project?: ProjectModel;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @BelongsTo(() => UserModel, 'userId')
  declare student?: UserModel;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare pdfUrl: string | null;
}
