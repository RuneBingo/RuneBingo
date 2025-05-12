import { NotFoundException } from '@nestjs/common';
import { type TestingModule, Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { FindBingoByBingoIdHandler, FindBingoByBingoIdQuery } from './find-bingo-by-bingo-id.query';

describe('FindBingoByBingoIdHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let handler: FindBingoByBingoIdHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Bingo, User, BingoParticipant])],
      providers: [FindBingoByBingoIdHandler, SeedingService],
    }).compile();

    handler = module.get(FindBingoByBingoIdHandler);
    seedingService = module.get(SeedingService);
  });

  beforeEach(async () => {
    await seedingService.initialize();
  });

  afterEach(async () => {
    await seedingService.clear();
  });

  afterAll(() => {
    return module.close();
  });

  it('throws NotFoundException if no user searches a private bingo', async () => {
    const requester = undefined;
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new FindBingoByBingoIdQuery({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException a non participant user searches a private bingo', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new FindBingoByBingoIdQuery({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('returns the bingo if public and non-auth user', async () => {
    const requester = undefined;
    const expectedBingo = seedingService.getEntity(Bingo, 'german-osrs');

    const query = new FindBingoByBingoIdQuery({
      requester,
      bingoId: expectedBingo.bingoId,
    });

    const bingo = await handler.execute(query);

    expect(bingo).toBeDefined();
    expect(bingo.bingoId).toBe(expectedBingo.bingoId);
  });

  it('returns the bingo if private and non-participant moderator user', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const expectedBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new FindBingoByBingoIdQuery({
      requester,
      bingoId: expectedBingo.bingoId,
    });

    const bingo = await handler.execute(query);

    expect(bingo).toBeDefined();
    expect(bingo.bingoId).toBe(expectedBingo.bingoId);
  });

  it('returns the bingo if private and non-moderator participant user', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const expectedBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new FindBingoByBingoIdQuery({
      requester,
      bingoId: expectedBingo.bingoId,
    });

    const bingo = await handler.execute(query);

    expect(bingo).toBeDefined();
    expect(bingo.bingoId).toBe(expectedBingo.bingoId);
  });
});
