import { type BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';

export class BingoInvitationPolicies {
  static canCreateInvitation(participant: BingoParticipant): boolean {
    return participant.role === BingoRoles.Owner || participant.role === BingoRoles.Organizer;
  }

  static canCancelInvitation(participant: BingoParticipant): boolean {
    return this.canCreateInvitation(participant);
  }

  static canDisableLink(participant: BingoParticipant): boolean {
    return this.canCreateInvitation(participant);
  }
}
