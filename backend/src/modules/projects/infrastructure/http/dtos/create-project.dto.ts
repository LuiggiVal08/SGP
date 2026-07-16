import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

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

  @IsOptional()
  @IsBoolean()
  cdSubmitted?: boolean;

  @IsUUID('4', { each: true })
  studentIds!: string[];
}
