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
  constructor(
    private readonly requester: User,
    private readonly participant: BingoParticipant | null = null,
  ) {}

  canUpdate(updates: Partial<Bingo>) {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);

    for (const field of Object.keys(updates)) {
      const restriction = this.fieldUpdateRestrictions[field] as FieldUpdateRestriction | undefined;
      if (!restriction) return false;

      if (restriction.moderatorBypass && requesterIsModerator) continue;

      if (!this.participant || !participantHasBingoRole(this.participant, BingoRoles.Organizer)) return false;

      if (restriction.owner && !participantHasBingoRole(this.participant, BingoRoles.Owner)) return false;
    }

    return true;
  }

  canDelete() {
    return this.isModeratorOrOwner();
  }

  canCancel() {
    return this.isModeratorOrOwner();
  }

  canReset() {
    return this.isModeratorOrOwner();
  }

  canStart() {
    return this.isModeratorOrOrganizer();
  }

  canEnd() {
    return this.isModeratorOrOrganizer();
  }

  canViewActivities() {
    return this.isModeratorOrOrganizer();
  }

  canCreateOrEditTile(bingo: Bingo): boolean {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);
    if (requesterIsModerator) return true;

    if (
      bingo.status !== BingoStatus.Pending ||
      !this.participant ||
      !participantHasBingoRole(this.participant, BingoRoles.Organizer)
    ) {
      return false;
    }

    return true;
  }

  canDeleteTile(bingo: Bingo): boolean {
    return this.canCreateOrEditTile(bingo);
  }

  private isModeratorOrOrganizer() {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);
    if (requesterIsModerator) return true;

    if (!this.participant || !participantHasBingoRole(this.participant, BingoRoles.Organizer)) return false;

    return true;
  }

  private isModeratorOrOwner() {
    const requesterIsModerator = userHasRole(this.requester, Roles.Moderator);
    if (requesterIsModerator) return true;

    if (!this.participant || !participantHasBingoRole(this.participant, BingoRoles.Owner)) return false;

    return true;
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
