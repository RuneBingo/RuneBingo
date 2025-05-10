import { ApiProperty } from '@nestjs/swagger';
import { BingoRoles } from '../roles/bingo-roles.constants';
import { IsEnum } from 'class-validator';

export class UpdateBingoParticipantDto {
  @ApiProperty({ required: false })
  teamName?: string;

  @ApiProperty({ required: false, enum: BingoRoles, enumName: "BingoRoles" })
  @IsEnum(BingoRoles)
  role?: BingoRoles;
}