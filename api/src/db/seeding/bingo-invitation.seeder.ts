import Joi from 'joi';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoInvitation } from '@/bingo/invitation/bingo-invitation.entity';
import { BingoInvitationStatus } from '@/bingo/invitation/bingo-invitation-status.enum';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { User } from '@/user/user.entity';

import { Seeder } from './seeder';

type BingoInvitationSeed = {
  bingo: string;
  createdBy: string;
  role: BingoRoles;
  team?: string;
  invitee?: string; // direct invitee username
  status?: BingoInvitationStatus;
  uses?: number;
  disabled?: boolean;
};

const schema = Joi.object<Record<string, BingoInvitationSeed>>().pattern(
  Joi.string(),
  Joi.object({
    bingo: Joi.string().required(),
    createdBy: Joi.string().required(),
    role: Joi.string()
      .valid(...Object.values(BingoRoles))
      .required(),
    team: Joi.string().optional(),
    invitee: Joi.string().optional(),
    status: Joi.string()
      .valid(...Object.values(BingoInvitationStatus))
      .optional(),
    uses: Joi.number().optional(),
    disabled: Joi.boolean().optional(),
  }),
);

export class BingoInvitationSeeder extends Seeder<BingoInvitation, BingoInvitationSeed> {
  entityName = BingoInvitation.name;
  identifierColumns = ['code'] satisfies (keyof BingoInvitation)[];
  schema = schema;

  protected deserialize(seed: BingoInvitationSeed): BingoInvitation {
    const bingo = this.seedingService.getEntity(Bingo, seed.bingo);
    const creator = this.seedingService.getEntity(User, seed.createdBy);
    const team = seed.team ? this.seedingService.getEntity(BingoTeam, seed.team) : null;
    const invitee = seed.invitee ? this.seedingService.getEntity(User, seed.invitee) : null;

    const invitation = new BingoInvitation();
    invitation.bingoId = bingo.id;
    invitation.bingo = Promise.resolve(bingo);
    invitation.createdById = creator.id;
    invitation.createdBy = Promise.resolve(creator);
    invitation.role = seed.role;
    invitation.teamId = team ? team.id : null;
    invitation.team = team ? Promise.resolve(team) : Promise.resolve(null);
    invitation.inviteeId = invitee ? invitee.id : null;
    invitation.invitee = invitee ? Promise.resolve(invitee) : Promise.resolve(null);
    invitation.status = seed.status ?? BingoInvitationStatus.Pending;
    invitation.uses = seed.uses ?? 0;
    invitation.disabled = seed.disabled ?? false;
    // code will be generated automatically
    return invitation;
  }

  protected getIdentifier(entity: BingoInvitation) {
    return { code: entity.code };
  }
}
