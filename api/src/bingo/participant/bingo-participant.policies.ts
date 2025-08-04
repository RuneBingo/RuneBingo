import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { type User } from '@/user/user.entity';

import { type BingoParticipant } from './bingo-participant.entity';
import { type UpdateBingoParticipantDto } from './dto/update-bingo-participant.dto';
import { BingoRoles } from './roles/bingo-roles.constants';
import { participantHasBingoRole } from './roles/bingo-roles.utils';

export class BingoParticipantPolicies {
  constructor(
    private readonly requester: User,
    private readonly requesterParticipant: BingoParticipant | undefined,
  ) {}

  canKick(participant: BingoParticipant) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);
    if (requesterIsModerator) return true;

    if (!this.requesterParticipant) return false;

    if (participant.role === BingoRoles.Owner) return false;
    if (
      participant.role === BingoRoles.Organizer &&
      !participantHasBingoRole(this.requesterParticipant, BingoRoles.Owner)
    )
      return false;

    return true;
  }

  canUpdate(participant: BingoParticipant, updates: UpdateBingoParticipantDto) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);
    if (requesterIsModerator) return true;

    if (!this.requesterParticipant) return false;

    // Only the owner can set the role of a participant
    if (updates.role && !participantHasBingoRole(this.requesterParticipant, BingoRoles.Owner)) {
      return false;
    }

    // Only an organizer or owner can update a participant
    if (!participantHasBingoRole(this.requesterParticipant, BingoRoles.Organizer)) return false;

    // Only an owner can update an owner
    if (
      !participantHasBingoRole(this.requesterParticipant, BingoRoles.Owner) &&
      participant.role === BingoRoles.Owner
    ) {
      return false;
    }

    return true;
  }

  canLeave() {
    if (!this.requesterParticipant) return false;

    return true;
  }

  canTransferOwnership() {
    if (!this.requesterParticipant) return false;

    if (this.requesterParticipant.role !== BingoRoles.Owner) return false;

    return true;
  }
}
