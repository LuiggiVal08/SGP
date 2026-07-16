import { IsNumber, IsString, IsOptional } from 'class-validator';

export class SubmitEvaluationDto {
  @IsNumber()
  score!: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
