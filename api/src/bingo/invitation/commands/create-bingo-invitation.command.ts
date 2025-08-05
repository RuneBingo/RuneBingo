import { type BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { type User } from '@/user/user.entity';

export class CreateBingoInvitationCommand {
  constructor(
    public readonly params: {
      requester: User;
      bingoId: string;
      username?: string; // undefined when creating link
      role: BingoRoles;
      teamName?: string;
    },
  ) {}
}
