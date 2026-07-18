import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class AssignPermissionDto {
  @IsString()
  permissionId: string;
}

export class AssignRoleDto {
  @IsString()
  roleId: string;
}
