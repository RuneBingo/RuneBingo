import { ApiProperty } from '@nestjs/swagger';

import { PaginatedDtoWithoutTotal } from '@/db/dto/paginated.dto';
import { BingoParticipantDto } from './bingo-participant.dto';


export class PaginatedBingoParticipantsDto extends PaginatedDtoWithoutTotal<BingoParticipantDto> {
  @ApiProperty({ type: [BingoParticipantDto] })
  declare items: BingoParticipantDto[];
}
