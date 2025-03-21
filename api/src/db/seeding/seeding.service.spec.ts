import { readFile } from 'fs/promises';
import { join } from 'path';

import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as YAML from 'yaml';

import { User } from '@/user/user.entity';

import { dbModule, entities } from '..';
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
      imports: [configModule, dbModule, TypeOrmModule.forFeature(entities)],
      providers: [SeedingService],
    }).compile();

    seedingService = module.get<SeedingService>(SeedingService);
    await seedingService.initialize();
  });

  afterAll(async () => {
    await seedingService.clear();
    await module.close();
  });

  it.each([['user', User]])('seeds %s successfully', async (fileName, entityClass) => {
    const seedData = await getSeedData(fileName);
    for (const identifier of Object.keys(seedData)) {
      const entity = seedingService.getEntity(entityClass, identifier);
      expect(entity).not.toBeNull();
      expect(entity).toBeInstanceOf(entityClass);
    }
  });
});
