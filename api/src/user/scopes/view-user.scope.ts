import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { Scope } from '@/db/scope';

import { type User } from '../user.entity';

export class ViewUserScope extends Scope<User> {
  resolve() {
    if (!this.requester) return this.query.andWhere('user.disabled_at IS NULL');

    if (userHasRole(this.requester, Roles.Moderator)) return this.query;

    return this.query.andWhere('(user.disabled_at IS NULL OR user.id = :id)', { id: this.requester.id });
  }
}
