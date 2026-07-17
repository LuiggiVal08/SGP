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
import { TagModel } from '@modules/tags/infrastructure/persistence/sequelize/models/tag.model';

interface ProjectTagAttributes {
  projectId: string;
  tagId: string;
}

type ProjectTagCreationAttributes = Optional<ProjectTagAttributes, never>;

@Table({ tableName: 'project_tags', timestamps: false })
export class ProjectTagModel extends Model<
  ProjectTagAttributes,
  ProjectTagCreationAttributes
> {
  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare projectId: string;

  @BelongsTo(() => ProjectModel)
  declare project?: ProjectModel;

  @ForeignKey(() => TagModel)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare tagId: string;

  @BelongsTo(() => TagModel)
  declare tag?: TagModel;
}
