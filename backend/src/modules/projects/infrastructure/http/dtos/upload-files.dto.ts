import {
  IsString,
  IsArray,
  IsEnum,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class FileItemDto {
  @IsString()
  fileName!: string;

  @IsString()
  urlPath!: string;

  @IsEnum(['THESIS_PDF', 'SOURCE_CODE', 'BUSINESS_PLAN'])
  fileType!: string;
}

export class UploadFilesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FileItemDto)
  files!: FileItemDto[];
}
