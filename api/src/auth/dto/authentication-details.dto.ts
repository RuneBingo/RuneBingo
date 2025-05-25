import { ApiProperty } from '@nestjs/swagger';

import { Bingo } from '@/bingo/bingo.entity';
import { ShortBingoDto } from '@/bingo/dto/short-bingo.dto';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { User } from '@/user/user.entity';

type ConstructorParams = {
  user: User;
  hasBingos: boolean;
  currentBingo?: Bingo | null;
  currentBingoRole?: BingoRoles | null;
};

export class AuthenticationDetailsDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  usernameNormalized: string;

  @ApiProperty({ required: false, type: String })
  gravatarHash: string | null;

  @ApiProperty()
  language: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  hasBingos: boolean;

  @ApiProperty({ required: false, type: ShortBingoDto })
  currentBingo: ShortBingoDto | null;

  constructor({ user, hasBingos, currentBingo, currentBingoRole }: ConstructorParams) {
    this.username = user.username;
    this.usernameNormalized = user.usernameNormalized;
    this.gravatarHash = user.gravatarHash;
    this.language = user.language;
    this.role = user.role;
    this.hasBingos = hasBingos;

    if (currentBingo && currentBingoRole) {
      this.currentBingo = {
        id: currentBingo.bingoId,
        title: currentBingo.title,
        status: currentBingo.status,
        role: currentBingoRole,
      };
    } else {
      this.currentBingo = null;
    }
  }
}
