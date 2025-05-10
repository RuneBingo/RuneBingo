import { type TestingModule, Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { SearchBingosHandler, SearchBingosQuery, type SearchBingosResult } from './search-bingos.query';
import { Bingo } from '../bingo.entity';

describe('SearchUsersHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let handler: SearchBingosHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Bingo])],
      providers: [SearchBingosHandler, SeedingService],
    }).compile();

    handler = module.get(SearchBingosHandler);
    seedingService = module.get(SeedingService);

    await seedingService.initialize();
  });

  afterAll(async () => {
    await seedingService.clear();
    return module.close();
  });

  it('applies search filter correctly', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedBingos = [seedingService.getEntity(Bingo, 'osrs-qc'), seedingService.getEntity(Bingo, 'german-osrs')];

    const query = new SearchBingosQuery({
      requester,
      search: 'osrs',
    });

    const result = await handler.execute(query);

    assertExpectedBingos(result, expectedBingos);
  });

  it('applies private filter correctly', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedBingos = [seedingService.getEntity(Bingo, 'osrs-qc')];

    const query = new SearchBingosQuery({
      requester,
      isPrivate: true,
    });

    const result = await handler.execute(query);

    assertExpectedBingos(result, expectedBingos);
  });

  it('should not return a private bingo for non member', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');

    const query = new SearchBingosQuery({
      requester,
      search: 'osrs',
      isPrivate: true,
    });

    const result = await handler.execute(query);

    expect(result.items.length).toBe(0);
  });

  it('should return one private bingo for a member', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const expectedBingos = [seedingService.getEntity(Bingo, 'osrs-qc')];

    const query = new SearchBingosQuery({
      requester,
      isPrivate: true,
    });

    const result = await handler.execute(query);

    assertExpectedBingos(result, expectedBingos);
  });

  it('applies status filter correctly', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedPendingBingos = [
      seedingService.getEntity(Bingo, 'osrs-qc'),
      seedingService.getEntity(Bingo, 'german-osrs'),
    ];
    const expectedCanceledBingos = [seedingService.getEntity(Bingo, 'canceled-bingo')];
    const expectedStartedBingos = [seedingService.getEntity(Bingo, 'started-bingo')];
    const expectedEndedBingos = [seedingService.getEntity(Bingo, 'ended-bingo')];

    const pendingBingosQuery = new SearchBingosQuery({
      requester,
      status: 'pending',
    });

    const canceledBingosQuery = new SearchBingosQuery({
      requester,
      status: 'canceled',
    });

    const startedBingosQuery = new SearchBingosQuery({
      requester,
      status: 'started',
    });

    const endedBingosQuery = new SearchBingosQuery({
      requester,
      status: 'ended',
    });

    const pendingBingosResult = await handler.execute(pendingBingosQuery);
    const canceledBingosResult = await handler.execute(canceledBingosQuery);
    const startedBingosResult = await handler.execute(startedBingosQuery);
    const endedBingosResult = await handler.execute(endedBingosQuery);

    assertExpectedBingos(pendingBingosResult, expectedPendingBingos);
    assertExpectedBingos(canceledBingosResult, expectedCanceledBingos);
    assertExpectedBingos(startedBingosResult, expectedStartedBingos);
    assertExpectedBingos(endedBingosResult, expectedEndedBingos);
  });

  const assertExpectedBingos = (result: SearchBingosResult, expectedBingos: Bingo[]) => {
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.length).toBe(expectedBingos.length);
    result.items.forEach((item, i) => {
      expect(expectedBingos[i]).not.toBeNull();
      expect(item.id).toBe(expectedBingos[i].id);
    });
  };
});
