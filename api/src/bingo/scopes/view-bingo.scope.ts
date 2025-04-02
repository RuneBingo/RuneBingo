import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { Scope } from '@/db/scope';

import { type Bingo } from '../bingo.entity';

export class ViewBingoScope extends Scope<Bingo> {
  resolve() {
    if (!this.requester) {
      return this.query.andWhere('bingo.private = false');
    }

    if (userHasRole(this.requester, Roles.Moderator)) return this.query;

    return this.query
      .leftJoin('bingo_participant', 'bingoParticipant', 'bingoParticipant.bingo_id = bingo.id')
      .andWhere('(bingo.private = false OR bingoParticipant.user_id = :requesterId)', {
        requesterId: this.requester.id,
      });
  }
}
