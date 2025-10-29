import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/user/dto/user.dto';

import { BingoTeam } from '../bingo-team.entity';

export class BingoTeamDto {
  constructor(bingoTeam: BingoTeam) {
    this.name = bingoTeam.name;
    this.nameNormalized = bingoTeam.nameNormalized;
    this.captain = null;
  }

  static async fromBingoTeam(bingoTeam: BingoTeam): Promise<BingoTeamDto> {
    const dto = new BingoTeamDto(bingoTeam);
    dto.captain = await bingoTeam.captain;
    return dto;
  }

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameNormalized: string;

  @ApiProperty()
  captain: UserDto | null;

  @ApiProperty()
  points: number;
}
