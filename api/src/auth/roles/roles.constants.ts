export enum Roles {
  User = 'user',
  Moderator = 'moderator',
  Admin = 'admin',
}

export const roleHierarchy = [Roles.User, Roles.Moderator, Roles.Admin] as const;
