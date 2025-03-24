import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { type User } from '@/user/user.entity';

import { type Session } from './session.entity';

export class SessionPolicies {
  constructor(private readonly requester: User | null) {}

  canCreate(session: Session, user: User) {
    if (!this.requester) return false;

    if (user.isDeleted || user.isDisabled) return false;

    if (userHasRole(this.requester, Roles.Admin)) return true;

    return session.userId === this.requester.id;
  }

  canSignOut(session: Session) {
    if (!this.requester) return false;

    if (userHasRole(this.requester, Roles.Admin)) return true;

    return session.userId === this.requester.id;
  }
}
