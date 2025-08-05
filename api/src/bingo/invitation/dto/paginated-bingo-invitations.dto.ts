import { type BingoInvitationDto } from './bingo-invitation.dto';

export class PaginatedBingoInvitationsDto {
  items: BingoInvitationDto[];
  total: number;
  limit: number;
  offset: number;

  constructor(data: PaginatedBingoInvitationsDto) {
    Object.assign(this, data);
  }
}
