import { IsNumber, IsString, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class SubmitEvaluationDto {
  @IsUUID()
  judgeId!: string;

  @IsNumber()
  @Min(0)
  @Max(20)
  score!: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
