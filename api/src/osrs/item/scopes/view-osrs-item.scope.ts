import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { Scope } from '@/db/scope';

import { type OsrsItem } from '../osrs-item.entity';

export class ViewOsrsItemScope extends Scope<OsrsItem> {
  resolve() {
    if (!this.requester || !userHasRole(this.requester, Roles.Moderator)) {
      return this.query.where('osrs_item.enabled = true');
    }

    return this.query;
  }
}
