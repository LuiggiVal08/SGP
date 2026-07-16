import {
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudentDto {
  @ApiProperty({
    example: 'a1b2c3d4-0000-0000-0000-000000000000',
    description: 'ID de la trayectoria',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  trajectoryId?: string;

  @ApiProperty({
    example: '2024-001',
    description: 'Número de matrícula (único)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  enrollmentNumber?: string;

  @ApiProperty({
    example: 2024,
    description: 'Cohorte de ingreso',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  cohort?: number;

  @ApiProperty({ example: 1, description: 'Trayecto actual', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  currentTrayecto?: number;
}
