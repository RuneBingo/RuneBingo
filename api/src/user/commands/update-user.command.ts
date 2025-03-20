import { Command } from '@nestjs/cqrs';

import { type Roles } from '@/auth/roles/roles.constants';

import { type User } from '../user.entity';

export type UpdateUserParams = {
  requester: User;
  username: string;
  updates: {
    username?: string;
    language?: string;
    role?: Roles;
  };
};

export type UpdateUserResult = User;

export class UpdateUserCommand extends Command<User> {
  public readonly requester: User;
  public readonly username: string;
  public readonly updates: {
    username?: string;
    language?: string;
    role?: Roles;
  };

  constructor({ requester, username, updates }: UpdateUserParams) {
    super();

    this.requester = requester;
    this.username = username;
    this.updates = updates;
  }
}
