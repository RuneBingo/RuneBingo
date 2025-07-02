import Joi from 'joi';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoTileCompletionMode } from '@/bingo/tile/bingo-tile-completion-mode.enum';
import { BingoTile } from '@/bingo/tile/bingo-tile.entity';

import { Seeder } from './seeder';

type BingoTileSeed = {
  bingo: string;
  x: number;
  y: number;
  value: number;
  free?: boolean;
  title: string;
  description: string;
  completionMode: BingoTileCompletionMode;
  media?: string; // TODO: not supported yet (platform work)
  imageUrl?: string;
};

const bingoTileSeedSchema = Joi.object<Record<string, BingoTileSeed>>().pattern(
  Joi.string(),
  Joi.object({
    bingo: Joi.string().required(),
    x: Joi.number().required(),
    y: Joi.number().required(),
    value: Joi.number().required(),
    free: Joi.boolean().optional(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    completionMode: Joi.string()
      .valid(...Object.values(BingoTileCompletionMode))
      .required(),
    media: Joi.string().optional(),
    imageUrl: Joi.string().uri().optional(),
  }),
);

export class BingoTileSeeder extends Seeder<BingoTile, BingoTileSeed> {
  entityName = BingoTile.name;
  identifierColumns = ['bingoId', 'x', 'y'] satisfies (keyof BingoTile)[];
  schema = bingoTileSeedSchema;

  protected deserialize(seed: BingoTileSeed): BingoTile {
    const bingo = this.seedingService.getEntity(Bingo, seed.bingo);
    // const media = seed.media ? this.seedingService.getEntity(Media, seed.media) : null;

    const bingoTile = new BingoTile();
    bingoTile.bingoId = bingo.id;
    bingoTile.bingo = Promise.resolve(bingo);
    bingoTile.x = seed.x;
    bingoTile.y = seed.y;
    bingoTile.value = seed.value;
    bingoTile.free = seed.free ?? false;
    bingoTile.title = seed.title;
    bingoTile.description = seed.description;
    bingoTile.completionMode = seed.completionMode;
    // bingoTile.mediaId = seed.media ? this.seedingService.getEntity(Media, seed.media).id : null;
    bingoTile.imageUrl = seed.imageUrl ?? null;

    return bingoTile;
  }

  protected getIdentifier(entity: BingoTile) {
    return { bingoId: entity.bingoId, x: entity.x, y: entity.y };
  }
}
