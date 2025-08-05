import { type User } from '@/user/user.entity';

export class CancelBingoInvitationCommand {
  constructor(
    public readonly params: {
      requester: User;
      bingoId: string;
      code: string;
    },
  ) {}
}
