import { type User } from '@/user/user.entity';

export class DisableBingoInvitationLinkCommand {
  constructor(
    public readonly params: {
      requester: User;
      bingoId: string;
      code: string;
      disabled: boolean;
    },
  ) {}
}
