import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { type User } from '@/user/user.entity';

import { type BingoParticipant } from './bingo-participant.entity';
import { BingoRoles } from './roles/bingo-roles.constants';
import { participantHasBingoRole } from './roles/bingo-roles.utils';

export class BingoParticipantPolicies {
  constructor(private readonly requester: User) {}

  canRemove(requesterParticipant: BingoParticipant, participantToRemove: BingoParticipant) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);

    if (
      !requesterIsModerator &&
      !participantHasBingoRole(requesterParticipant, BingoRoles.Organizer) &&
      requesterParticipant.userId !== participantToRemove.userId
    ) {
      return false;
    }

    return true;
  }

  canUpdate(requesterParticipant: BingoParticipant, participantToUpdate: BingoParticipant, role?: BingoRoles) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);

    if (role && !participantHasBingoRole(requesterParticipant, BingoRoles.Owner)) {
      return false;
    }

    if (
      !requesterIsModerator &&
      !participantHasBingoRole(requesterParticipant, BingoRoles.Organizer) &&
      requesterParticipant.userId !== participantToUpdate.userId
    ) {
      return false;
    }

    return true;
  }
}
