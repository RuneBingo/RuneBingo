import { type BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { type User } from '@/user/user.entity';

import { type BingoInvitationStatus } from '../bingo-invitation-status.enum';

export class SearchBingoInvitationsQuery {
  constructor(
    public readonly params: {
      requester: User;
      bingoId: string;
      query?: string;
      status?: BingoInvitationStatus;
      role?: BingoRoles;
      teamName?: string;
      limit: number;
      offset: number;
      sort?: 'username' | 'status' | 'teamName' | 'createdAt';
      order?: 'ASC' | 'DESC';
    },
  ) {}
}
