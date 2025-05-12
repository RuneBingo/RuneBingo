import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/user/dto/user.dto';

import { BingoParticipant } from '../bingo-participant.entity';
import { BingoTeamDto } from '@/bingo/team/dto/bingo-team.dto';

export class BingoParticipantDto {
  constructor(bingoParticipant: BingoParticipant) {
    this.user = null;
    this.role = bingoParticipant.role;
    this.teamName = "";
    this.teamNameNormalized = "";
  }

  static async fromBingoParticipant(bingoParticipant: BingoParticipant): Promise<BingoParticipantDto> {
    const dto = new BingoParticipantDto(bingoParticipant);

    const [user, team] = await Promise.all([bingoParticipant.user, bingoParticipant.team]);

    dto.user = user;
    dto.teamName = team.name;
    dto.teamNameNormalized = team.nameNormalized;

    return dto;
  }
  
  @ApiProperty()
  teamName: string;

  @ApiProperty()
  teamNameNormalized: string;

  @ApiProperty()
  user: UserDto | null;

  @ApiProperty()
  role: string;
}
