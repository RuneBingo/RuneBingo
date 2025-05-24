import { Scope } from '@/db/scope';

import { type Bingo } from '../bingo.entity';

export class ParticipatingBingoScope extends Scope<Bingo> {
  resolve() {
    if (!this.requester) return this.query.andWhere('true = false');

    return this.query.andWhere(
      'exists (select 1 from bingo_participant where bingo_id = bingo.id and user_id = :requesterId)',
      {
        requesterId: this.requester.id,
      },
    );
  }
}
