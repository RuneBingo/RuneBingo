import { Scope } from '@/db/scope';
import { BingoParticipant } from '../bingo-participant.entity';
import { Bingo } from '@/bingo/bingo.entity';
import { User } from '@/user/user.entity';
import { SelectQueryBuilder } from 'typeorm';

export class ViewBingoParticipantsScope extends Scope<BingoParticipant> {
  constructor(
    public readonly requester: User | undefined,
    public readonly query: SelectQueryBuilder<BingoParticipant>,
    private readonly bingo: Bingo,
  ) {
    super(requester, query);
  }
  resolve() {
    if (!this.requester) {
        if (!this.bingo.private) {
            return this.query;
        } else {
            return this.query.andWhere('1 = 0');
        }
    }

    if (!this.bingo.private) {
      return this.query;
    }

    return this.query.andWhere(
      'exists(select 1 from bingo_participant where bingo_id = :bingoId AND user_id = :requesterId)',
      {
        bingoId: this.bingo.id,
        requesterId: this.requester.id,
      },
    );
  }
}
