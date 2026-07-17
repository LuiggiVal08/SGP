import {
  IsString,
  IsUUID,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionAnswerDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la pregunta de seguridad',
  })
  @IsUUID()
  questionId!: string;

  @ApiProperty({
    example: 'Firulais',
    description: 'Respuesta a la pregunta de seguridad',
  })
  @IsString()
  @MinLength(2)
  answer!: string;
}

export class SetSecurityQuestionsDto {
  @ApiProperty({
    type: [QuestionAnswerDto],
    description: 'Lista de 3 preguntas con sus respuestas',
  })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  questions!: QuestionAnswerDto[];
}
