import { type SelectQueryBuilder } from 'typeorm';

import { type Bingo } from '@/bingo/bingo.entity';
import { Scope } from '@/db/scope';
import { type User } from '@/user/user.entity';

import { type BingoParticipant } from '../bingo-participant.entity';
import { userHasRole } from '@/auth/roles/roles.utils';
import { Roles } from '@/auth/roles/roles.constants';

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
      if (this.bingo.private) return this.query.andWhere('1 = 0');

      return this.query;
    }

    if (!this.bingo.private || userHasRole(this.requester, Roles.Moderator)) {
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
