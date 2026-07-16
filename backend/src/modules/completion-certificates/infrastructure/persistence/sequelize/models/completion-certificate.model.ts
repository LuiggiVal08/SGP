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
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';

interface CompletionCertificateAttributes {
  id: string;
  projectId: string;
  userId: string;
  pdfUrl: string;
  serialNumber: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

type CompletionCertificateCreationAttributes = Optional<
  CompletionCertificateAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

@Table({ tableName: 'completion_certificates', timestamps: true })
export class CompletionCertificateModel extends Model<
  CompletionCertificateAttributes,
  CompletionCertificateCreationAttributes
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

  @BelongsTo(() => UserModel)
  declare user?: UserModel;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare pdfUrl: string;

  @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
  declare serialNumber: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare issuedAt: Date;
}
