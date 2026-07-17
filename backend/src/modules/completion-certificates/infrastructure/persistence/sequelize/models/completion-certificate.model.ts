import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ProjectAuthorModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project-author.model';

interface CompletionCertificateAttributes {
  id: string;
  authorId: string;
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

  @ForeignKey(() => ProjectAuthorModel)
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  declare authorId: string;

  @BelongsTo(() => ProjectAuthorModel)
  declare author?: ProjectAuthorModel;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare pdfUrl: string;

  @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
  declare serialNumber: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare issuedAt: Date;
}
