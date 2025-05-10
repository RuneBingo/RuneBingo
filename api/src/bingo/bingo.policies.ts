import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { type BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { BingoRoles } from '@/bingo-participant/roles/bingo-roles.constants';
import { participantHasBingoRole } from '@/bingo-participant/roles/bingo-roles.utils';
import { type User } from '@/user/user.entity';

import { type Bingo } from './bingo.entity';

export class BingoPolicies {
  constructor(private readonly requester: User) {}

  async canCreate() {
    const bingoParticipants = await this.requester.participants;

    if (!bingoParticipants || bingoParticipants.length === 0) return true;

    for (const bingoParticipant of bingoParticipants) {
      const bingo = await bingoParticipant.bingo; // Ensure `await` is used properly

      if (!bingo || bingo.canceledAt || bingo.endedAt) continue;

      return false;
    }

    return true;
  }

  canUpdate(participant: BingoParticipant | null, bingo: Bingo) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);

    if (
      !requesterIsModerator &&
      (!participant || !participantHasBingoRole(participant, BingoRoles.Organizer) || bingo.startedAt)
    ) {
      return false;
    }

    return true;
  }

  canDelete(participant: BingoParticipant | null) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);

    if (!requesterIsModerator && (!participant || !participantHasBingoRole(participant, BingoRoles.Owner))) {
      return false;
    }

    return true;
  }

  canCancel(participant: BingoParticipant | null, bingo: Bingo) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);

    if (bingo.canceledAt || bingo.endedAt) {
      return false;
    }

    if (!requesterIsModerator && (!participant || !participantHasBingoRole(participant, BingoRoles.Organizer))) {
      return false;
    }

    return true;
  }

  canViewActivities(participant: BingoParticipant | null) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);

    if (!requesterIsModerator && (!participant || !participantHasBingoRole(participant, BingoRoles.Organizer))) {
      return false;
    }

    return true;
  }
}
