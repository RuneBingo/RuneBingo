import Joi from 'joi';

import { Bingo } from '@/bingo/bingo.entity';
import { User } from '@/user/user.entity';

import { Seeder } from './seeder';

type BingoSeed = {
  createdBy: string;
  language: string;
  title: string;
  description: string;
  private: boolean;
  width: number;
  height: number;
  fullLineValue: number;
  startDate: string;
  endDate: string;
  startedAt?: Date;
  endedAt?: Date;
  canceledAt?: Date;
  maxRegistrationDate: string;
  deletedAt?: Date;
};

const bingoSeedSchema = Joi.object<Record<string, BingoSeed>>().pattern(
  Joi.string(),
  Joi.object({
    createdBy: Joi.string().required(),
    title: Joi.string().required(),
    language: Joi.string().required(),
    description: Joi.string().required(),
    private: Joi.boolean().required(),
    width: Joi.number().required(),
    height: Joi.number().required(),
    fullLineValue: Joi.number().required(),
    startDate: Joi.string().isoDate().required(),
    endDate: Joi.string().isoDate().required(),
    maxRegistrationDate: Joi.string().isoDate().required(),
    startedAt: Joi.date().optional(),
    endedAt: Joi.date().optional(),
    canceledAt: Joi.date().optional(),
    deletedAt: Joi.date().optional(),
  }),
);

export class BingoSeeder extends Seeder<Bingo, BingoSeed> {
  entityName = Bingo.name;
  identifierColumns = ['slug'] satisfies (keyof Bingo)[];
  schema = bingoSeedSchema;

  protected deserialize(seed: BingoSeed): Bingo {
    const user = this.seedingService.getEntity(User, seed.createdBy);
    const slug = Bingo.slugifyTitle(seed.title);

    const bingo = new Bingo();

    bingo.createdById = user.id;
    bingo.createdBy = Promise.resolve(user);
    bingo.slug = slug;
    bingo.language = seed.language;
    bingo.title = seed.title;
    bingo.description = seed.description;
    bingo.private = seed.private;
    bingo.width = seed.width;
    bingo.height = seed.height;
    bingo.fullLineValue = seed.fullLineValue;
    bingo.startDate = seed.startDate;
    bingo.endDate = seed.endDate;
    bingo.maxRegistrationDate = seed.maxRegistrationDate;
    bingo.startedAt = seed.startedAt ?? null;
    bingo.endedAt = seed.endedAt ?? null;
    bingo.canceledAt = seed.canceledAt ?? null;
    bingo.deletedAt = seed.deletedAt ?? null;

    return bingo;
  }

  protected getIdentifier(entity: Bingo) {
    return { slug: entity.slug };
  }
}
