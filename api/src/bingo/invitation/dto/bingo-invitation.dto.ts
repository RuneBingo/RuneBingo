import { Expose } from 'class-transformer';

import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';

import { BingoInvitationStatus } from '../bingo-invitation-status.enum';
import { BingoInvitation } from '../bingo-invitation.entity';

export class BingoInvitationDto {
  @Expose()
  code!: string;

  @Expose()
  status!: BingoInvitationStatus;

  @Expose()
  role!: BingoRoles;

  @Expose()
  teamName!: string | null;

  @Expose()
  inviteeUsername!: string | null;

  @Expose()
  uses!: number;

  @Expose()
  createdByUsername!: string;

  @Expose()
  createdAt!: Date;

  static async fromInvitation(invite: BingoInvitation): Promise<BingoInvitationDto> {
    const dto = new BingoInvitationDto();
    dto.code = invite.code;
    dto.status = invite.status;
    dto.role = invite.role;

    const team = await invite.team;
    dto.teamName = team ? team.name : null;

    const invitee = await invite.invitee;
    dto.inviteeUsername = invitee ? invitee.username : null;

    dto.uses = invite.uses;

    const createdBy = await invite.createdBy;
    dto.createdByUsername = createdBy.username;

    dto.createdAt = invite.createdAt;

    return dto;
  }
}
