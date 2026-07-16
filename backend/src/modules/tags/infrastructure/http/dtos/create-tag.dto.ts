import { IsString, IsIn, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'Inteligencia Artificial' })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({
    example: 'TECNOLOGIA',
    description: 'TECNOLOGIA | TEMA | TUTOR | METODOLOGIA',
  })
  @IsIn(['TECNOLOGIA', 'TEMA', 'TUTOR', 'METODOLOGIA'])
  category!: string;
}
