import type { Roles } from '@/auth/roles/roles.constants';

export type UserUpdatedParams = {
  userId: number;
  requesterId?: number | null;
  updates: {
    username?: string;
    language?: string;
    role?: Roles;
  };
};

export class UserUpdatedEvent {
  public readonly userId: number;
  public readonly requesterId: number | null;
  public readonly updates: {
    username?: string;
    language?: string;
    role?: Roles;
  };

  constructor({ userId, requesterId = null, updates }: UserUpdatedParams) {
    this.userId = userId;
    this.requesterId = requesterId;
    this.updates = updates;
  }
}
