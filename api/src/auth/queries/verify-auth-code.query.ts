import { Query } from '@nestjs/cqrs';

import { type AuthCodePayload } from '../auth-codes.types';

export type VerifyAuthCodeResult = AuthCodePayload;

export class VerifyAuthCodeQuery extends Query<VerifyAuthCodeResult> {
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {
    super();
  }
}
