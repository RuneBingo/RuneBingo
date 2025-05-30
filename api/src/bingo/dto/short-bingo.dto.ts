import { ApiProperty } from '@nestjs/swagger';

import { BingoStatus } from '@/bingo/bingo-status.enum';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';

export class ShortBingoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: BingoStatus })
  status: BingoStatus;

  @ApiProperty({ enum: BingoRoles })
  role: BingoRoles;
}
