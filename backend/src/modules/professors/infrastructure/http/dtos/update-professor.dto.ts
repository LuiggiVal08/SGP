import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfessorDto {
  @ApiProperty({
    example: 'Ingeniería de Software',
    description: 'Especialidad del profesor',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  specialization?: string;
}
