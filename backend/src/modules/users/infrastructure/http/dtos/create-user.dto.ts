import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  dni!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  roleName!: string;

  @IsOptional()
  @IsString()
  careerId?: string;

  @IsOptional()
  @IsString()
  institutionId?: string;
}
