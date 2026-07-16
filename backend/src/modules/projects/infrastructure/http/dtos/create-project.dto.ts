import {
  IsString,
  IsUUID,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  problemStatement?: string;

  @IsUUID()
  subjectAssignmentId!: string;

  @IsUUID()
  locationId!: string;

  @IsUUID()
  communityTutorId!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  authorIds!: string[];

  @IsOptional()
  @IsBoolean()
  cdSubmitted?: boolean;
}
