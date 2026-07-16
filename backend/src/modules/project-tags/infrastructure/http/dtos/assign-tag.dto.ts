import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTagDto {
  @ApiProperty({ example: 'c2000000-0000-4000-8000-000000000001' })
  @IsUUID()
  tagId!: string;
}
