import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { CareerModel } from '@modules/careers/infrastructure/persistence/sequelize/models/career.model';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';
import { ProjectFileModel } from './project-file.model';
import { ProjectAuthorModel } from './project-author.model';

interface ProjectAttributes {
  id: string;
  title: string;
  year: number;
  status: string;
  careerId: string;
  tutorId: string;
}

type ProjectCreationAttributes = Optional<ProjectAttributes, 'id' | 'status'>;

@Table({ tableName: 'projects', timestamps: true })
export class ProjectModel extends Model<
  ProjectAttributes,
  ProjectCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare title: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare year: number;

  @Column({ type: DataType.STRING(30), defaultValue: 'PENDING_VALIDATION' })
  declare status: string;

  @ForeignKey(() => CareerModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare careerId: string;

  @BelongsTo(() => CareerModel)
  declare career?: CareerModel;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare tutorId: string;

  @BelongsTo(() => UserModel, 'tutorId')
  declare tutor?: UserModel;

  @BelongsToMany(() => UserModel, () => ProjectAuthorModel)
  declare authors?: UserModel[];

  @HasMany(() => ProjectFileModel)
  declare files?: ProjectFileModel[];
}
