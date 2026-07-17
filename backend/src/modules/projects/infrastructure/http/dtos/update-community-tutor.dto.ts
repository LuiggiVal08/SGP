import { IsOptional, IsString, ValidateNested } from 'class-validator';
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

export class UpdateCommunityTutorDto {
  @ApiProperty({ description: 'Datos del tutor comunitario' })
  @ValidateNested()
  @Type(() => CommunityTutorDto)
  communityTutor!: CommunityTutorDto;
}
