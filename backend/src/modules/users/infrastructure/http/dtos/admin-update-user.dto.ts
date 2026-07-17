import {
  IsString,
  IsOptional,
  IsEmail,
  Length,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminUpdateUserDto {
  @ApiProperty({
    example: '12345678',
    description: 'Documento nacional de identidad',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  dni?: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @ApiProperty({
    example: 'juan.perez@institucion.edu',
    description: 'Correo electrónico',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'STUDENT',
    description: 'Nombre del rol (STUDENT, TUTOR, ADMIN)',
    required: false,
  })
  @IsOptional()
  @IsString()
  roleName?: string;

  @ApiProperty({
    example: 'uuid-PNF',
    description: 'ID de la PNF',
    required: false,
  })
  @IsOptional()
  @IsString()
  pnfId?: string;

  @ApiProperty({
    example: 'uuid-institucion',
    description: 'ID de la institución',
    required: false,
  })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @ApiProperty({
    example: '+584121234567',
    description: 'Teléfono de contacto',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string;

  @ApiProperty({
    example: true,
    description: 'Estado activo/inactivo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
