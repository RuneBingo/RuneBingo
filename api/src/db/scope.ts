import { type SelectQueryBuilder, type ObjectLiteral } from 'typeorm';

import { type User } from '@/user/user.entity';

export abstract class Scope<Entity extends ObjectLiteral> {
  constructor(
    protected readonly requester: User | null | undefined,
    protected readonly query: SelectQueryBuilder<Entity>,
  ) {}

  public abstract resolve(): SelectQueryBuilder<Entity>;
}
