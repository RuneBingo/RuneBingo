import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsOptional } from 'class-validator';

export class ResetBingoDto {
  @ApiProperty()
  @IsISO8601()
  startDate: string;

  @ApiProperty()
  @IsISO8601()
  endDate: string;

  @ApiProperty()
  @IsISO8601()
  maxRegistrationDate: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  deleteTiles?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  deleteTeams?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  deleteParticipants?: boolean;
}
