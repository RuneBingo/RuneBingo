import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { User } from '@/user/user.entity';

export class UpdateBingoInvitationCommand {
  constructor(
    public readonly params: {
      requester: User;
      bingoId: string;
      code: string;
      role?: BingoRoles;
      teamName?: string;
    },
  ) {}
} 