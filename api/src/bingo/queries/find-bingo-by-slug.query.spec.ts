import { NotFoundException } from '@nestjs/common';
import { type TestingModule, Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { FindBingoBySlugHandler, FindBingoBySlugQuery } from './find-bingo-by-slug.query';
import { Bingo } from '../bingo.entity';

describe('FindBingoBySlugHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let handler: FindBingoBySlugHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Bingo, User, BingoParticipant])],
      providers: [FindBingoBySlugHandler, SeedingService],
    }).compile();

    handler = module.get(FindBingoBySlugHandler);
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

  describe('when searching for all bingos', () => {
    it('throws NotFoundException if no user searches a private bingo', async () => {
      const requester = undefined;

      const query = new FindBingoBySlugQuery({
        requester,
        slug: 'osrs-qc',
      });

      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException a non participant user searches a private bingo', async () => {
      const requester = seedingService.getEntity(User, 'b0aty');

      const query = new FindBingoBySlugQuery({
        requester,
        slug: 'osrs-qc',
      });

      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });

    it('returns the bingo if public and non-auth user', async () => {
      const requester = undefined;
      const expectedBingo = seedingService.getEntity(Bingo, 'german-osrs');

      const query = new FindBingoBySlugQuery({
        requester,
        slug: 'german-osrs',
      });

      const bingo = await handler.execute(query);

      expect(bingo).toBeDefined();
      expect(bingo.slug).toBe(expectedBingo.slug);
    });

    it('returns the bingo if private and non-participant moderator user', async () => {
      const requester = seedingService.getEntity(User, 'zezima');
      const expectedBingo = seedingService.getEntity(Bingo, 'osrs-qc');

      const query = new FindBingoBySlugQuery({
        requester,
        slug: 'osrs-qc',
      });

      const bingo = await handler.execute(query);

      expect(bingo).toBeDefined();
      expect(bingo.slug).toBe(expectedBingo.slug);
    });

    it('returns the bingo if private and non-moderator participant user', async () => {
      const requester = seedingService.getEntity(User, 'dee420');
      const expectedBingo = seedingService.getEntity(Bingo, 'osrs-qc');

      const query = new FindBingoBySlugQuery({
        requester,
        slug: 'osrs-qc',
      });

      const bingo = await handler.execute(query);

      expect(bingo).toBeDefined();
      expect(bingo.slug).toBe(expectedBingo.slug);
    });
  });

  describe('when searching for participating bingos', () => {
    it('throws NotFoundException if no user searches any bingo', async () => {
      const requester = undefined;
      const query = new FindBingoBySlugQuery({
        requester,
        slug: 'german-osrs',
        participating: true,
      });

      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException a user searches for a bingo that he is not participating to', async () => {
      const requester = seedingService.getEntity(User, 'zezima');
      const query = new FindBingoBySlugQuery({
        requester,
        slug: 'german-osrs',
        participating: true,
      });

      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });

    it('returns the bingo if user searches for a bingo that he is participating to', async () => {
      const requester = seedingService.getEntity(User, 'dee420');
      const expectedBingo = seedingService.getEntity(Bingo, 'osrs-qc');

      const query = new FindBingoBySlugQuery({
        requester,
        slug: 'osrs-qc',
        participating: true,
      });

      const bingo = await handler.execute(query);

      expect(bingo).toBeDefined();
      expect(bingo.slug).toBe(expectedBingo.slug);
    });
  });

  describe('when searching for non-participating bingos', () => {
    it('throws NotFoundException if no user searches any bingo', async () => {
      const requester = undefined;
      const query = new FindBingoBySlugQuery({
        requester,
        slug: 'german-osrs',
        participating: false,
      });

      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException a user searches for a bingo that he is participating to', async () => {
      const requester = seedingService.getEntity(User, 'dee420');
      const query = new FindBingoBySlugQuery({
        requester,
        slug: 'osrs-qc',
        participating: false,
      });

      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });

    it('returns the bingo if user searches for a bingo that he is not participating to', async () => {
      const requester = seedingService.getEntity(User, 'zezima');
      const expectedBingo = seedingService.getEntity(Bingo, 'german-osrs');

      const query = new FindBingoBySlugQuery({
        requester,
        slug: 'german-osrs',
        participating: false,
      });

      const bingo = await handler.execute(query);

      expect(bingo).toBeDefined();
      expect(bingo.slug).toBe(expectedBingo.slug);
    });
  });
});
