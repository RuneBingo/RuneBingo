import { readFile } from 'fs/promises';
import { join } from 'path';

import { Test, type TestingModule } from '@nestjs/testing';
import * as YAML from 'yaml';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { BingoTileItem } from '@/bingo/tile/bingo-tile-item';
import { BingoTile } from '@/bingo/tile/bingo-tile.entity';
import { OsrsItem } from '@/osrs/item/osrs-item.entity';
import { Session } from '@/session/session.entity';
import { User } from '@/user/user.entity';

import { dbModule } from '..';
import { SeedingService } from './seeding.service';
import { configModule } from '../../config';

describe('SeedingService', () => {
  let module: TestingModule;
  let seedingService: SeedingService;

  const testSeedPath = join(__dirname, 'test');

  const getSeedData = async (entity: string): Promise<object> => {
    const path = join(testSeedPath, `${entity}.yml`);
    const data = await readFile(path, 'utf-8');
    return YAML.parse(data) as Record<string, object>;
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule],
      providers: [SeedingService],
    }).compile();

    seedingService = module.get<SeedingService>(SeedingService);
    await seedingService.initialize();
  });

  afterAll(async () => {
    await seedingService.clear();
    await module.close();
  });

  it.each([
    ['user', User],
    ['session', Session],
    ['bingo', Bingo],
    ['bingo-tile', BingoTile],
    ['bingo-tile-item', BingoTileItem],
    ['bingo-team', BingoTeam],
    ['bingo-participant', BingoParticipant],
    ['osrs-item', OsrsItem],
  ])('seeds %s successfully', async (fileName, entityClass) => {
    const seedData = await getSeedData(fileName);
    for (const identifier of Object.keys(seedData)) {
      const entity = seedingService.getEntity(entityClass, identifier);
      expect(entity).not.toBeNull();
      expect(entity).toBeInstanceOf(entityClass);
    }
  });
});
