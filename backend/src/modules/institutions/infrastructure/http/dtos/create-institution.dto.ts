import { IsString, IsOptional } from 'class-validator';

export class CreateInstitutionDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  acronym?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;
}
