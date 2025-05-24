import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { type User } from '@/user/user.entity';

import { type BingoParticipant } from './bingo-participant.entity';
import { BingoRoles } from './roles/bingo-roles.constants';
import { participantHasBingoRole } from './roles/bingo-roles.utils';

export class BingoParticipantPolicies {
  constructor(private readonly requester: User) {}

  canRemove(requesterParticipant: BingoParticipant | undefined, participantToRemove: BingoParticipant) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);
    if (requesterIsModerator) return true;

    if (!requesterParticipant) return false;

    if (participantToRemove.userId === this.requester.id) {
      return participantToRemove.role !== BingoRoles.Organizer;
    }

    if (
      !participantHasBingoRole(requesterParticipant, BingoRoles.Organizer) &&
      requesterParticipant.userId !== participantToRemove.userId
    ) {
      return false;
    }

    return true;
  }

  canUpdate(
    requesterParticipant: BingoParticipant | undefined,
    participantToUpdate: BingoParticipant,
    role?: BingoRoles,
  ) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);

    if (requesterIsModerator) return true;

    if (!requesterParticipant) return false;

    if (role && !participantHasBingoRole(requesterParticipant, BingoRoles.Owner)) {
      return false;
    }

    if (
      !participantHasBingoRole(requesterParticipant, BingoRoles.Organizer) &&
      requesterParticipant.userId !== participantToUpdate.userId
    ) {
      return false;
    }

    return true;
  }
}
