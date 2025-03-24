import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { Scope } from '@/db/scope';

import type { Session } from '../session.entity';

export class ViewSessionScope extends Scope<Session> {
  resolve() {
    // TODO: false = true is dirty, find a better way to do this
    if (!this.requester) return this.query.andWhere('false = true');

    if (userHasRole(this.requester, Roles.Admin)) return this.query;

    return this.query.andWhere('session.userId = :userId', { userId: this.requester.id });
  }
}
