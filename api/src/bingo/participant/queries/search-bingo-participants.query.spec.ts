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

  it('returns the list of bingo participants correctly', async () => {
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
    });

    const result = await handler.execute(query);

    assertExpectedBingos(result, expectedParticipants);
  });

  it('applies the role filter correctly', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedParticipants = [seedingService.getEntity(BingoParticipant, 'char0o')];

    const searchBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
      role: BingoRoles.Owner,
    });

    const result = await handler.execute(query);

    assertExpectedBingos(result, expectedParticipants);
  });

  it('applies the team filter correctly', async () => {
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
    });

    const result = await handler.execute(query);

    assertExpectedBingos(result, expectedParticipants);
  });

  it('should return an empty array if not a participant in a private bingo', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const expectedParticipants = [];

    const searchBingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
    });

    const result = await handler.execute(query);

    assertExpectedBingos(result, expectedParticipants);
  });

  it('should return participants if not participant in public bingo', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedParticipants = [seedingService.getEntity(BingoParticipant, 'didiking-german')];

    const searchBingo = seedingService.getEntity(Bingo, 'german-osrs');

    const query = new SearchBingoParticipantsQuery({
      requester,
      bingoId: searchBingo.bingoId,
    });

    const result = await handler.execute(query);

    assertExpectedBingos(result, expectedParticipants);
  });

  it('should return participants if requester is moderator but not participant of private bingo', async () => {
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
    });

    const result = await handler.execute(query);

    assertExpectedBingos(result, expectedParticipants);
  });

  const assertExpectedBingos = (result: SearchBingoParticipantsResult, expectedParticipants: BingoParticipant[]) => {
    expect(result.items.length).toBe(expectedParticipants.length);
    result.items.forEach((item, i) => {
      expect(expectedParticipants[i]).not.toBeNull();
      expect(item.bingoId).toBe(expectedParticipants[i].bingoId);
      expect(item.userId).toBe(expectedParticipants[i].userId);
    });
  };
});
