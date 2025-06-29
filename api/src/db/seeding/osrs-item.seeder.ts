import Joi from 'joi';

import { OsrsItem } from '@/osrs/item/osrs-item.entity';

import { Seeder } from './seeder';

type OsrsItemSeed = {
  id: number;
  name: string;
  configName: string;
  category: number;
  exchangeable: boolean;
  members: boolean;
  examine: string;
  iconUrl: string;
  imageUrl: string;
  enabled: boolean;
};

const osrsItemSeedSchema = Joi.object<Record<string, OsrsItemSeed>>().pattern(
  Joi.string(),
  Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    configName: Joi.string().required(),
    category: Joi.number().required(),
    exchangeable: Joi.boolean().required(),
    members: Joi.boolean().required(),
    examine: Joi.string().required(),
    iconUrl: Joi.string().uri().required(),
    imageUrl: Joi.string().uri().required(),
    enabled: Joi.boolean().required(),
  }),
);

export class OsrsItemSeeder extends Seeder<OsrsItem, OsrsItemSeed> {
  entityName = OsrsItem.name;
  identifierColumns = ['id'] satisfies (keyof OsrsItem)[];
  schema = osrsItemSeedSchema;

  protected deserialize(seed: OsrsItemSeed): OsrsItem {
    const osrsItem = new OsrsItem();
    osrsItem.id = seed.id;
    osrsItem.name = seed.name;
    osrsItem.configName = seed.configName;
    osrsItem.category = seed.category;
    osrsItem.exchangeable = seed.exchangeable;
    osrsItem.members = seed.members;
    osrsItem.examine = seed.examine;
    osrsItem.iconUrl = seed.iconUrl;
    osrsItem.imageUrl = seed.imageUrl;
    osrsItem.enabled = seed.enabled;

    return osrsItem;
  }

  protected getIdentifier(entity: OsrsItem) {
    return { id: entity.id };
  }
}
