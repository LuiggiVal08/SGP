import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';

interface InstitutionAttributes {
  id: string;
  name: string;
  acronym: string;
  email: string;
  contactInfo: string;
  coordinatorId: string | null;
}

type InstitutionCreationAttributes = Optional<InstitutionAttributes, 'id'>;

@Table({ tableName: 'institutions', timestamps: true })
export class InstitutionModel extends Model<
  InstitutionAttributes,
  InstitutionCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare acronym: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare email: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare contactInfo: string;

  @Column({ type: DataType.UUID, allowNull: true })
  declare coordinatorId: string | null;

  @HasMany(() => UserModel)
  declare users?: UserModel[];
}
