import {
  IsString,
  IsEmail,
  IsArray,
  MinLength,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordInitDto {
  @ApiProperty({
    example: 'usuario@sgp.com',
    description: 'Email o DNI del usuario',
  })
  @IsString()
  identifier!: string;
}

export class ForgotPasswordAnswerDto {
  @ApiProperty({
    description: 'ID de la pregunta de seguridad',
  })
  @IsUUID()
  questionId!: string;

  @ApiProperty({
    description: 'Respuesta a la pregunta',
  })
  @IsString()
  @MinLength(2)
  answer!: string;
}

export class ForgotPasswordVerifyDto {
  @ApiProperty({
    example: 'usuario@sgp.com',
    description: 'Email o DNI del usuario',
  })
  @IsString()
  identifier!: string;

  @ApiProperty({
    type: [ForgotPasswordAnswerDto],
    description: 'Respuestas a las preguntas de seguridad',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ForgotPasswordAnswerDto)
  answers!: ForgotPasswordAnswerDto[];
}

export class ForgotPasswordResetDto {
  @ApiProperty({
    description:
      'Token de restablecimiento (PASSWORD_RESET) obtenido en verify',
  })
  @IsString()
  resetToken!: string;

  @ApiProperty({
    example: 'newSecurePass456',
    description: 'Nueva contraseña',
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
