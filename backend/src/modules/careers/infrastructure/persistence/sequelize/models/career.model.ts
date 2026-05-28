import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';
import { ProjectModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project.model';

interface CareerAttributes {
  id: string;
  name: string;
}

type CareerCreationAttributes = Optional<CareerAttributes, 'id'>;

@Table({ tableName: 'careers', timestamps: true })
export class CareerModel extends Model<
  CareerAttributes,
  CareerCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @HasMany(() => UserModel)
  declare users?: UserModel[];

  @HasMany(() => ProjectModel)
  declare projects?: ProjectModel[];
}
