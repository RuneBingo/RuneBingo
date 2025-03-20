import { Query } from '@nestjs/cqrs';

import { type User } from '../user.entity';

export type FindUserByUsernameParams = {
  username: string;
  requester: User | undefined;
};

export type FindUserByUsernameResult = User;

export class FindUserByUsernameQuery extends Query<FindUserByUsernameResult> {
  public readonly username: string;
  public readonly requester: User | undefined;

  constructor({ username, requester }: FindUserByUsernameParams) {
    super();

    this.username = username;
    this.requester = requester;
  }
}
