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

    return this.query.andWhere(
      '(bingo.private = false OR exists (select 1 from bingo_participant where bingo_id = bingo.id and user_id = :requesterId))',
      {
        requesterId: this.requester.id,
      },
    );
  }
}
