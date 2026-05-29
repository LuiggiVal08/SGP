import {
  IsString,
  IsNumber,
  IsUUID,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  title!: string;

  @Type(() => Number)
  @IsNumber()
  year!: number;

  @IsUUID()
  careerId!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  authorIds!: string[];

  @IsUUID()
  tutorId!: string;
}
