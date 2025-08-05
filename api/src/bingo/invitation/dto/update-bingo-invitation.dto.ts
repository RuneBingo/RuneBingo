import { IsEnum, IsOptional, IsString } from 'class-validator';

import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';

export class UpdateBingoInvitationDto {
  @IsOptional()
  @IsEnum(BingoRoles)
  role?: BingoRoles;

  @IsOptional()
  @IsString()
  teamName?: string;
}
