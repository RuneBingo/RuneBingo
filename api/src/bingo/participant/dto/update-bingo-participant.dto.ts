import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { BingoRoles } from '../roles/bingo-roles.constants';

export class UpdateBingoParticipantDto {
  @ApiProperty({ required: false })
  teamName?: string;

  @ApiProperty({ required: false, enum: BingoRoles, enumName: 'BingoRoles' })
  @IsEnum(BingoRoles)
  role?: BingoRoles;
}
