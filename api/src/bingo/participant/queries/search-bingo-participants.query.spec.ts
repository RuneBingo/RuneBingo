import { NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { BingoParticipant } from '../bingo-participant.entity';
import {
  SearchBingoParticipantsHandler,
  SearchBingoParticipantsQuery,
  type SearchBingoParticipantsResult,
} from './search-bingo-participants.query';
import { BingoRoles } from '../roles/bingo-roles.constants';

describe('AddBingoParticipantHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let handler: SearchBingoParticipantsHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        configModule,
        dbModule,
        i18nModule,
        TypeOrmModule.forFeature([Bingo, User, BingoParticipant, BingoTeam]),
      ],
      providers: [
        SearchBingoParticipantsHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(SearchBingoParticipantsHandler);
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

  it('throws NotFoundException if the requester is not allowed to view the bingo', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const searchBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
      sort: 'role',
      order: 'DESC',
    });

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('returns the list of bingo participants sorted by role descending', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedParticipants = [
      seedingService.getEntity(BingoParticipant, 'char0o'),
      seedingService.getEntity(BingoParticipant, 'didiking-osrs'),
      seedingService.getEntity(BingoParticipant, 'dee420'),
    ];

    const searchBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
      sort: 'role',
      order: 'DESC',
    });

    const result = await handler.execute(query);

    assertExpectedBingoParticipants(result, expectedParticipants);
  });

  it('filters participants by role', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedParticipants = [seedingService.getEntity(BingoParticipant, 'char0o')];

    const searchBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
      role: BingoRoles.Owner,
      sort: 'role',
      order: 'DESC',
    });

    const result = await handler.execute(query);

    assertExpectedBingoParticipants(result, expectedParticipants);
  });

  it('filters participants by team', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedParticipants = [
      seedingService.getEntity(BingoParticipant, 'char0o'),
      seedingService.getEntity(BingoParticipant, 'dee420'),
    ];

    const searchBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
      teamName: 'Les boys',
      sort: 'role',
      order: 'DESC',
    });

    const result = await handler.execute(query);

    assertExpectedBingoParticipants(result, expectedParticipants);
  });

  it('returns participants if the requester is not a participant but the bingo is public', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedParticipants = [seedingService.getEntity(BingoParticipant, 'didiking-german')];

    const searchBingo = seedingService.getEntity(Bingo, 'german-osrs');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
      sort: 'role',
      order: 'DESC',
    });

    const result = await handler.execute(query);

    assertExpectedBingoParticipants(result, expectedParticipants);
  });

  it('returns participants if the requester is a moderator but not a participant and the bingo is private', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const expectedParticipants = [
      seedingService.getEntity(BingoParticipant, 'char0o'),
      seedingService.getEntity(BingoParticipant, 'didiking-osrs'),
      seedingService.getEntity(BingoParticipant, 'dee420'),
    ];

    const searchBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
      sort: 'role',
      order: 'DESC',
    });

    const result = await handler.execute(query);

    assertExpectedBingoParticipants(result, expectedParticipants);
  });

  const assertExpectedBingoParticipants = (
    result: SearchBingoParticipantsResult,
    expectedParticipants: BingoParticipant[],
  ) => {
    expect(result.items.length).toBe(expectedParticipants.length);
    result.items.forEach((item, i) => {
      expect(expectedParticipants[i]).not.toBeNull();
      expect(item.bingoId).toBe(expectedParticipants[i].bingoId);
      expect(item.userId).toBe(expectedParticipants[i].userId);
    });
  };

  it('sorts participants by username', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedParticipants = [
      seedingService.getEntity(BingoParticipant, 'char0o'),
      seedingService.getEntity(BingoParticipant, 'dee420'),
      seedingService.getEntity(BingoParticipant, 'didiking-osrs'),
    ];

    const searchBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
      sort: 'username',
      order: 'ASC',
    });

    const result = await handler.execute(query);

    assertExpectedBingoParticipants(result, expectedParticipants);
  });

  it('sorts participants by team name', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedParticipants = [
      seedingService.getEntity(BingoParticipant, 'char0o'),
      seedingService.getEntity(BingoParticipant, 'dee420'),
      seedingService.getEntity(BingoParticipant, 'didiking-osrs'),
    ];

    const searchBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
      sort: 'teamName',
      order: 'ASC',
    });

    const result = await handler.execute(query);

    assertExpectedBingoParticipants(result, expectedParticipants);
  });

  it('sorts participants by role', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedParticipants = [
      seedingService.getEntity(BingoParticipant, 'dee420'),
      seedingService.getEntity(BingoParticipant, 'didiking-osrs'),
      seedingService.getEntity(BingoParticipant, 'char0o'),
    ];

    const searchBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
      sort: 'role',
      order: 'ASC',
    });

    const result = await handler.execute(query);

    assertExpectedBingoParticipants(result, expectedParticipants);
  });
});
