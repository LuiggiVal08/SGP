import {
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  IsArray,
  IsBoolean,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CommunityTutorDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo' })
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({
    example: '28532259',
    description: 'Cédula de identidad',
  })
  @IsOptional()
  @IsString()
  dni?: string;

  @ApiPropertyOptional({ example: '+584121234567', description: 'Teléfono' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'juan@comunidad.org', description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: 'Consejo Comunal Boconó',
    description: 'Organización',
  })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional({ example: 'Presidente', description: 'Cargo' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({
    example: 'Contacto vía WhatsApp',
    description: 'Notas',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'Proyecto Actualizado',
    description: 'Título del proyecto',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 2026, description: 'Año del proyecto' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ description: 'ID de la PNF' })
  @IsOptional()
  @IsUUID()
  pnfId?: string;

  @ApiPropertyOptional({ description: 'ID del tutor' })
  @IsOptional()
  @IsUUID()
  tutorId?: string;

  @ApiPropertyOptional({
    description:
      'IDs de los autores (mín. 2, máx. 3, hasta 5 si es caso excepcional)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(5)
  authorIds?: string[];

  @ApiPropertyOptional({
    description:
      'Caso excepcional aprobado por consejo (permite hasta 5 autores)',
  })
  @IsOptional()
  @IsBoolean()
  isExceptional?: boolean;

  @ApiPropertyOptional({ description: 'ID del docente evaluador' })
  @IsOptional()
  @IsUUID()
  docenteId?: string;

  @ApiPropertyOptional({ description: 'Trayecto del proyecto (1-4)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  trayecto?: number;

  @ApiPropertyOptional({
    description: 'Datos del tutor comunitario',
    type: CommunityTutorDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CommunityTutorDto)
  communityTutor?: CommunityTutorDto;

  @ApiPropertyOptional({
    description: 'Metodología del proyecto',
  })
  @IsOptional()
  @IsString()
  methodology?: string;
}
