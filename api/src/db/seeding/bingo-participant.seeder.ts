import Joi from 'joi';

import { BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { BingoRoles } from '@/bingo-participant/roles/bingo-roles.constants';

import { Seeder } from './seeder';

type BingoParticipantSeed = {
  userId: number;
  bingoId: number;
  role: BingoRoles;
  teamId: number | null;
};

const bingoParticipantSchema = Joi.object<Record<string, BingoParticipantSeed>>().pattern(
  Joi.string(),
  Joi.object({
    userId: Joi.number().required(),
    bingoId: Joi.number().required(),
    role: Joi.string()
      .valid(...Object.values(BingoRoles))
      .required(),
    teamId: Joi.number().optional(),
  }),
);

export class BingoParticipantSeeder extends Seeder<BingoParticipant, BingoParticipantSeed> {
  entityName = BingoParticipant.name;
  identifierColumns = ['userId', 'bingoId'] satisfies (keyof BingoParticipant)[];
  schema = bingoParticipantSchema;

  protected deserialize(seed: BingoParticipantSeed): BingoParticipant {
    const bingoParticipant = new BingoParticipant();
    bingoParticipant.userId = seed.userId;
    bingoParticipant.bingoId = seed.bingoId;
    bingoParticipant.role = seed.role;
    bingoParticipant.teamId = seed.teamId;

    return bingoParticipant;
  }

  protected getIdentifier(entity: BingoParticipant) {
    return { userId: entity.userId, bingoId: entity.bingoId };
  }
}
