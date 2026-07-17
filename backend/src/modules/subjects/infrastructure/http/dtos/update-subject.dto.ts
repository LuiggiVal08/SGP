import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubjectDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  trajectoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;
}
