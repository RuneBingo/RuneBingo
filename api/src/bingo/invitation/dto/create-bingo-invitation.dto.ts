import { IsEnum, IsOptional, IsString } from 'class-validator';

import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';

export class CreateBingoInvitationDto {
  /** Username of the invitee. If omitted, an invitation link is created */
  @IsOptional()
  @IsString()
  username?: string;

  @IsEnum(BingoRoles)
  role!: BingoRoles;

  /** Optional slug / name of the team */
  @IsOptional()
  @IsString()
  teamName?: string;
}
