import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class StartBingoDto {
  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  endDate?: string;
}
