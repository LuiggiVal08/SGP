import { IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ example: 'b2000000-0000-4000-8000-000000000001' })
  @IsUUID()
  trajectoryId!: string;

  @ApiProperty({ example: 'Programación I' })
  @IsString()
  @Length(1, 100)
  name!: string;
}
