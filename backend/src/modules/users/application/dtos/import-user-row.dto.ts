import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class ImportUserRowDto {
  @IsString()
  @Length(1, 20)
  dni!: string;

  @IsString()
  @Length(1, 50)
  firstName!: string;

  @IsString()
  @Length(1, 50)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 100)
  password!: string;

  @IsString()
  @Length(1, 50)
  roleName!: string;

  @IsOptional()
  @IsString()
  pnfId?: string;

  @IsOptional()
  @IsString()
  institutionId?: string;
}
