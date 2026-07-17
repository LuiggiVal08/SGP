import { IsString, IsOptional, IsIn, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTagDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiProperty({
    required: false,
    description: 'TECNOLOGIA | TEMA | TUTOR | METODOLOGIA',
  })
  @IsOptional()
  @IsIn(['TECNOLOGIA', 'TEMA', 'TUTOR', 'METODOLOGIA'])
  category?: string;
}
