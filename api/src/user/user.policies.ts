import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';

import { type User } from './user.entity';

export class UserPolicies {
  constructor(private readonly requester: User | null) {}

  canCreate(user: User) {
    if (!this.requester) return user.role === Roles.User;

    return userHasRole(this.requester, Roles.Admin);
  }

  canUpdate(user: User, updates: Partial<User>) {
    if (!this.requester) return false;

    if (userHasRole(this.requester, Roles.Admin)) return true;

    if (!userHasRole(this.requester, Roles.Moderator) && user.id !== this.requester.id) return false;

    const adminOnlyProperties = ['role'];
    if (Object.keys(updates).some((k) => adminOnlyProperties.includes(k))) return false;

    return true;
  }

  canDelete(user: User) {
    if (!this.requester) return false;

    if (userHasRole(this.requester, Roles.Admin)) return true;

    return user.id === this.requester.id;
  }

  canViewActivities(user: User) {
    if (!this.requester) return false;

    return user.id === this.requester.id || userHasRole(this.requester, Roles.Admin);
  }
}
