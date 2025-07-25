import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/user/dto/user.dto';

import { BingoParticipant } from '../bingo-participant.entity';
import { BingoRoles } from '../roles/bingo-roles.constants';

export class BingoParticipantDto {
  constructor(bingoParticipant: BingoParticipant) {
    this.user = null;
    this.role = bingoParticipant.role;
    this.teamName = '';
    this.teamNameNormalized = '';
  }

  static async fromBingoParticipant(bingoParticipant: BingoParticipant): Promise<BingoParticipantDto> {
    const dto = new BingoParticipantDto(bingoParticipant);

    const [user, team] = await Promise.all([bingoParticipant.user, bingoParticipant.team]);

    dto.user = user;
    dto.teamName = team ? team.name : null;
    dto.teamNameNormalized = team ? team.nameNormalized : null;

    return dto;
  }

  @ApiProperty()
  teamName: string | null;

  @ApiProperty()
  teamNameNormalized: string | null;

  @ApiProperty()
  user: UserDto | null;

  @ApiProperty({ enum: BingoRoles, enumName: 'BingoRoles' })
  role: BingoRoles;
}
