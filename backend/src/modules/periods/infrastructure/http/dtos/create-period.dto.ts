import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePeriodDto {
  @ApiProperty({ example: '2024-I', description: 'Nombre del periodo' })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({ example: '2024-01-15', description: 'Fecha de inicio' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2024-06-15', description: 'Fecha de fin' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el periodo está activo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
