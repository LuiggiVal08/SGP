import {
  IsString,
  IsOptional,
  IsEmail,
  Length,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: '12345678',
    description: 'Documento nacional de identidad',
  })
  @IsString()
  @Length(1, 20)
  dni!: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  @IsString()
  @Length(1, 50)
  firstName!: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario' })
  @IsString()
  @Length(1, 50)
  lastName!: string;

  @ApiProperty({
    example: 'juan.perez@institucion.edu',
    description: 'Correo electrónico',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'STUDENT',
    description: 'Nombre del rol (STUDENT, DOCENTE, ADMIN, IRCOP)',
  })
  @IsString()
  roleName!: string;

  @ApiProperty({
    example: 'uuid-PNF',
    description: 'ID de la PNF (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  pnfId?: string;

  @ApiProperty({
    example: 'uuid-institucion',
    description: 'ID de la institución (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @ApiProperty({
    example: '+584121234567',
    description: 'Teléfono de contacto (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string;
}
