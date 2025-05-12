import Joi from 'joi';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { User } from '@/user/user.entity';

import { Seeder } from './seeder';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';

type BingoParticipantSeed = {
  user: string;
  bingo: string;
  role: BingoRoles;
  team?: string;
  deletedAt?: Date;
};

const bingoParticipantSchema = Joi.object<Record<string, BingoParticipantSeed>>().pattern(
  Joi.string(),
  Joi.object({
    user: Joi.string().required(),
    bingo: Joi.string().required(),
    role: Joi.string()
      .valid(...Object.values(BingoRoles))
      .required(),
    team: Joi.string().optional(),
    deletedAt: Joi.date().optional(),
  }),
);

export class BingoParticipantSeeder extends Seeder<BingoParticipant, BingoParticipantSeed> {
  entityName = BingoParticipant.name;
  identifierColumns = ['userId', 'bingoId'] satisfies (keyof BingoParticipant)[];
  schema = bingoParticipantSchema;

  protected deserialize(seed: BingoParticipantSeed): BingoParticipant {
    const user = this.seedingService.getEntity(User, seed.user);
    const bingo = this.seedingService.getEntity(Bingo, seed.bingo);
    const team = seed.team ? this.seedingService.getEntity(BingoTeam, seed.team) : null;

    const bingoParticipant = new BingoParticipant();
    bingoParticipant.userId = user.id;
    bingoParticipant.bingoId = bingo.id;
    bingoParticipant.bingo = Promise.resolve(bingo);
    bingoParticipant.user = Promise.resolve(user);
    bingoParticipant.role = seed.role;
    bingoParticipant.teamId = team ? team.id : null;
    bingoParticipant.team = team ? Promise.resolve(team) : Promise.resolve(null);

    return bingoParticipant;
  }

  protected getIdentifier(entity: BingoParticipant) {
    return { userId: entity.userId, bingoId: entity.bingoId };
  }
}
