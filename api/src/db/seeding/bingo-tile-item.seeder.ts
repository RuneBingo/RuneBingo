import Joi from 'joi';

import { BingoTileItem } from '@/bingo/tile/bingo-tile-item';
import { BingoTile } from '@/bingo/tile/bingo-tile.entity';
import { OsrsItem } from '@/osrs/item/osrs-item.entity';

import { Seeder } from './seeder';

type BingoTileItemSeed = {
  index: number;
  tile: string;
  item: string;
  quantity?: number;
};

const bingoTileItemSeedSchema = Joi.object<Record<string, BingoTileItemSeed>>().pattern(
  Joi.string(),
  Joi.object({
    index: Joi.number().required(),
    tile: Joi.string().required(),
    item: Joi.string().required(),
    quantity: Joi.number().optional(),
  }),
);

export class BingoTileItemSeeder extends Seeder<BingoTileItem, BingoTileItemSeed> {
  entityName = BingoTileItem.name;
  identifierColumns = ['index', 'bingoTileId', 'osrsItemId'] satisfies (keyof BingoTileItem)[];
  schema = bingoTileItemSeedSchema;

  protected deserialize(seed: BingoTileItemSeed): BingoTileItem {
    const tile = this.seedingService.getEntity(BingoTile, seed.tile);
    const item = this.seedingService.getEntity(OsrsItem, seed.item);

    const bingoTileItem = new BingoTileItem();
    bingoTileItem.index = seed.index;
    bingoTileItem.bingoTileId = tile.id;
    bingoTileItem.bingoTile = Promise.resolve(tile);
    bingoTileItem.osrsItemId = item.id;
    bingoTileItem.osrsItem = Promise.resolve(item);
    bingoTileItem.quantity = seed.quantity ?? 1;

    return bingoTileItem;
  }

  protected getIdentifier(entity: BingoTileItem) {
    return {
      index: entity.index,
      bingoTileId: entity.bingoTileId,
      osrsItemId: entity.osrsItemId,
    };
  }
}
