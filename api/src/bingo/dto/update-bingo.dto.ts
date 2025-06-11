import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class UpdateBingoDto {
  @ApiProperty()
  @IsOptional()
  language?: string;

  @ApiProperty()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  private?: boolean;

  @ApiProperty()
  @IsOptional()
  fullLineValue?: number;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  maxRegistrationDate?: string;
}
