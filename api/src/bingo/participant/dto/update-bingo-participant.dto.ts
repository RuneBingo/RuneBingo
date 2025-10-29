import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { BingoRoles } from '../roles/bingo-roles.constants';

export class UpdateBingoParticipantDto {
  @ApiProperty({ required: false })
  @IsOptional()
  teamName?: string;

  @ApiProperty({ required: false, enum: BingoRoles, enumName: 'BingoRoles' })
  @IsEnum(BingoRoles)
  @IsOptional()
  role?: BingoRoles;
}
