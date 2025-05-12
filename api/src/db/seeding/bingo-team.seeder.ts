import Joi from 'joi';

import { Bingo } from '@/bingo/bingo.entity';
import { User } from '@/user/user.entity';

import { Seeder } from './seeder';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';


type BingoTeamSeed = {
  bingo: string;
  name: string;
  captain: string;
  points: number;
  deletedAt?: Date;
};

const bingoTeamSchema = Joi.object<Record<string, BingoTeamSeed>>().pattern(
  Joi.string(),
  Joi.object({
    bingo: Joi.string().required(),
    captain: Joi.string().required(),
    name: Joi.string().required(),
    points: Joi.number().required(),
    deletedAt: Joi.date().optional(),
  }),
);

export class BingoTeamSeeder extends Seeder<BingoTeam, BingoTeamSeed> {
  entityName = BingoTeam.name;
  identifierColumns = ['bingoId', 'nameNormalized'] satisfies (keyof BingoTeam)[];
  schema = bingoTeamSchema;

  protected deserialize(seed: BingoTeamSeed): BingoTeam {
    const captain = this.seedingService.getEntity(User, seed.captain);
    const bingo = this.seedingService.getEntity(Bingo, seed.bingo);

    const bingoTeam = new BingoTeam();
    bingoTeam.captainId = captain.id;
    bingoTeam.name = seed.name;
    bingoTeam.nameNormalized = BingoTeam.normalizeName(seed.name);
    bingoTeam.bingoId = bingo.id;
    bingoTeam.bingo = Promise.resolve(bingo);
    bingoTeam.captain = Promise.resolve(captain);
    bingoTeam.points = seed.points;

    return bingoTeam;
  }

  protected getIdentifier(entity: BingoTeam) {
    return { name: entity.nameNormalized, bingoId: entity.bingoId };
  }
}
