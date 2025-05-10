import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateBingoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  language: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  private: boolean;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  width: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  height: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  fullLineValue: number;

  @ApiProperty()
  @IsISO8601()
  startDate: string;

  @ApiProperty()
  @IsISO8601()
  endDate: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  maxRegistrationDate: string;
}
