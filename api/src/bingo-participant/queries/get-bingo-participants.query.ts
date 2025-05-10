import { Query } from '@nestjs/cqrs';

import { type BingoParticipant } from '../bingo-participant.entity';

export type GetBingoParticipantsParams = {
  bingoId: number;
};

export type GetBingoParticipantsResult = BingoParticipant[];

export class GetBingoParticipantsQuery extends Query<GetBingoParticipantsResult> {
  constructor(public readonly params: GetBingoParticipantsParams) {
    super();
  }
}
