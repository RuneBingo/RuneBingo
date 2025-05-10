import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class UpdateBingoDto {
  @ApiProperty()
  language: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  private: boolean;

  @ApiProperty()
  fullLineValue: number;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  startDate: string;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  endDate: string;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  maxRegistrationDate: string;
}
