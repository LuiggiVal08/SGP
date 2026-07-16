import { IsUUID, IsOptional, IsInt, Min } from 'class-validator';

export class AddProjectAuthorDto {
  @IsUUID()
  studentId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  authorOrder?: number;
}
