// src/modules/users/infrastructure/persistence/user.model.ts
import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { Optional } from 'sequelize';

// 1. Defines qué atributos tiene el modelo en la base de datos
interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  username: string;
  email: string;
  password?: string;
  isActive: boolean;
}

// 2. Defines cuáles de esos atributos pueden ser opcionales al crear/actualizar (por ejemplo, el id si es autogenerado, o campos por defecto)
// 2. Defines cuáles de esos atributos pueden ser opcionales al crear/actualizar
type UserCreationAttributes = Optional<UserAttributes, 'id'>;

@Table({
  tableName: 'users', // 👈 Nombre de la tabla en inglés
  timestamps: true, // Crea automáticamente createdAt y updatedAt en inglés
})
export class UserModel extends Model<UserAttributes, UserCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  firstName!: string; // 👈 nombre

  @Column({ type: DataType.STRING(50), allowNull: false })
  lastName!: string; // 👈 apellido

  @Column({ type: DataType.STRING(20), unique: true, allowNull: false })
  dni!: string; // 👈 cédula o dni

  @Column({ type: DataType.STRING(50), unique: true, allowNull: false })
  username!: string; // 👈 usuario

  @Column({ type: DataType.STRING(100), unique: true, allowNull: false })
  email!: string; // 👈 correo

  @Column({ type: DataType.STRING(255), allowNull: false })
  password!: string; // 👈 contraseña

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;
}
