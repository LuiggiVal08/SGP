import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({
    example: 'admin@sgp.com',
    description: 'Email o DNI del usuario',
  })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiPropertyOptional({
    example: 'admin@sgp.com',
    description: 'Email del usuario (compatibilidad; equivale a identifier)',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña' })
  @IsString()
  @MinLength(6)
  password!: string;
}
