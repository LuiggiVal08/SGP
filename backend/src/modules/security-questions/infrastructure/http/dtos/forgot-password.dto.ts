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
    description: 'Email del usuario',
  })
  @IsEmail()
  email!: string;
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
    description: 'Token obtenido del paso init',
  })
  @IsString()
  resetToken!: string;

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
    description: 'Token obtenido del paso verify',
  })
  @IsString()
  verificationToken!: string;

  @ApiProperty({
    example: 'newSecurePass456',
    description: 'Nueva contraseña',
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
