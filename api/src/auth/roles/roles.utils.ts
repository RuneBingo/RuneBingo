import { type User } from '@/user/user.entity';

import { type Roles, roleHierarchy } from './roles.constants';

export function userHasRole(user: User, role: Roles) {
  return roleHierarchy.indexOf(user.role) >= roleHierarchy.indexOf(role);
}
