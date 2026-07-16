import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { Optional } from 'sequelize';

interface CompletionCertificateAttributes {
  id: string;
  authorId: string;
  issuedAt: Date;
  pdfUrl: string | null;
  code: string | null;
}

type CompletionCertificateCreationAttributes = Optional<
  CompletionCertificateAttributes,
  'id'
>;

@Table({ tableName: 'completion_certificates', timestamps: false })
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

  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  declare authorId: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare issuedAt: Date;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare pdfUrl: string | null;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare code: string | null;
}
