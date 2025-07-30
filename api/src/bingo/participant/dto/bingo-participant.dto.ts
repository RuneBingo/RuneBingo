import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/user/dto/user.dto';

import { BingoParticipant } from '../bingo-participant.entity';
import { BingoRoles } from '../roles/bingo-roles.constants';

export class BingoParticipantDto {
  constructor(bingoParticipant: BingoParticipant) {
    this.userId = bingoParticipant.userId;
    this.username = '';
    this.user = null;
    this.role = bingoParticipant.role;
    this.teamName = '';
    this.teamNameNormalized = '';
    this.points = bingoParticipant.points;
    this.createdAt = bingoParticipant.createdAt;
    this.invitedBy = null;
  }

  static async fromBingoParticipant(bingoParticipant: BingoParticipant): Promise<BingoParticipantDto> {
    const dto = new BingoParticipantDto(bingoParticipant);

    const [user, team, invitedBy] = await Promise.all([
      bingoParticipant.user,
      bingoParticipant.team,
      bingoParticipant.invitedBy,
    ]);

    dto.user = user;
    dto.username = user ? user.username : '';
    dto.teamName = team ? team.name : null;
    dto.teamNameNormalized = team ? team.nameNormalized : null;
    dto.invitedBy = invitedBy ? new UserDto(invitedBy) : null;

    return dto;
  }

  @ApiProperty()
  userId: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  teamName: string | null;

  @ApiProperty()
  teamNameNormalized: string | null;

  @ApiProperty()
  user: UserDto | null;

  @ApiProperty({ enum: BingoRoles, enumName: 'BingoRoles' })
  role: BingoRoles;

  @ApiProperty()
  points: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  invitedBy: UserDto | null;
}
