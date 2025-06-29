import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { type BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { participantHasBingoRole } from '@/bingo/participant/roles/bingo-roles.utils';
import { type User } from '@/user/user.entity';

import { BingoStatus } from './bingo-status.enum';
import { type Bingo } from './bingo.entity';

type FieldUpdateRestriction = {
  owner?: boolean;
  moderatorBypass?: boolean;
};

export class BingoPolicies {
  constructor(private readonly requester: User) {}

  canUpdate(participant: BingoParticipant | null, updates: Partial<Bingo>) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);

    for (const field of Object.keys(updates)) {
      const restriction = this.fieldUpdateRestrictions[field] as FieldUpdateRestriction | undefined;
      if (!restriction) return false;

      if (restriction.moderatorBypass && requesterIsModerator) continue;

      if (!participant || !participantHasBingoRole(participant, BingoRoles.Organizer)) return false;

      if (restriction.owner && !participantHasBingoRole(participant, BingoRoles.Owner)) return false;
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

  canCreateOrEditTile(participant: BingoParticipant | null, bingo: Bingo): boolean {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);
    if (requesterIsModerator) return true;

    if (
      bingo.status !== BingoStatus.Pending ||
      !participant ||
      !participantHasBingoRole(participant, BingoRoles.Organizer)
    ) {
      return false;
    }

    return true;
  }

  canDeleteTile(participant: BingoParticipant | null, bingo: Bingo): boolean {
    return this.canCreateOrEditTile(participant, bingo);
  }

  /** Determines which fields can be updated and in which conditions for the `canUpdate` policy. */
  private readonly fieldUpdateRestrictions: Readonly<{ [key in keyof Bingo]?: FieldUpdateRestriction }> = {
    language: { moderatorBypass: true },
    title: { moderatorBypass: true },
    description: { moderatorBypass: true },
    private: { moderatorBypass: true },
    startDate: { moderatorBypass: true },
    endDate: { moderatorBypass: true },
    maxRegistrationDate: { moderatorBypass: true },
    fullLineValue: { moderatorBypass: true },
    width: { moderatorBypass: true },
    height: { moderatorBypass: true },
  };
}
