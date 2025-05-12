import Joi from 'joi';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { BingoRoles } from '@/bingo/participant/roles/bingo-roles.constants';
import { User } from '@/user/user.entity';

import { Seeder } from './seeder';

type BingoParticipantSeed = {
  user: string;
  bingo: string;
  role: BingoRoles;
  teamId: number | null;
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
    teamId: Joi.number().optional(),
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

    const bingoParticipant = new BingoParticipant();
    bingoParticipant.userId = user.id;
    bingoParticipant.bingoId = bingo.id;
    bingoParticipant.bingo = Promise.resolve(bingo);
    bingoParticipant.user = Promise.resolve(user);
    bingoParticipant.role = seed.role;
    bingoParticipant.teamId = seed.teamId;

    return bingoParticipant;
  }

  protected getIdentifier(entity: BingoParticipant) {
    return { userId: entity.userId, bingoId: entity.bingoId };
  }
}
