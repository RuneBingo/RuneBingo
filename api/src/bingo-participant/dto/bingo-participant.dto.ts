import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/user/dto/user.dto';

import { BingoParticipant } from '../bingo-participant.entity';

export class BingoParticipantDto {
  constructor(bingoParticipant: BingoParticipant) {
    this.user = null;
    this.role = bingoParticipant.role;
  }

  static async fromBingoParticipant(bingoParticipant: BingoParticipant): Promise<BingoParticipantDto> {
    const dto = new BingoParticipantDto(bingoParticipant);

    const [user] = await Promise.all([bingoParticipant.user]);

    dto.user = user;
    //dto.team = team;

    return dto;
  }
  // To implement
  //@ApiProperty()
  //team: TeamDto | null;

  @ApiProperty()
  user: UserDto | null;

  @ApiProperty()
  role: string;
}
