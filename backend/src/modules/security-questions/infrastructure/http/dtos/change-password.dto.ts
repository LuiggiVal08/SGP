import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Contraseña actual del usuario',
  })
  @IsString()
  @MinLength(6)
  currentPassword!: string;

  @ApiProperty({
    example: 'newSecurePass456',
    description: 'Nueva contraseña',
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
