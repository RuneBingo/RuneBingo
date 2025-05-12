import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { type TestingModule, Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Activity } from '@/activity/activity.entity';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { SearchBingoActivitiesHandler, SearchBingoActivitiesQuery } from './search-bingo-activities.query';
import { Bingo } from '../bingo.entity';
import { v4 } from 'uuid';

describe('SearchUserActivitiesHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let handler: SearchBingoActivitiesHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Activity, Bingo, BingoParticipant])],
      providers: [SearchBingoActivitiesHandler, SeedingService],
    }).compile();

    handler = module.get(SearchBingoActivitiesHandler);
    seedingService = module.get(SeedingService);

    await seedingService.initialize();
  });

  afterAll(async () => {
    await seedingService.clear();
    return module.close();
  });

  it('throws NotFoundException if the bingo does not exist', async () => {
    const requester = seedingService.getEntity(User, 'char0o');

    const query = new SearchBingoActivitiesQuery({
      bingoId: v4(),
      requester,
    });

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the user is not an organizer or moderator', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoActivitiesQuery({
      bingoId: bingo.bingoId,
      requester,
    });

    await expect(handler.execute(query)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if the user is only a participant', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoActivitiesQuery({
      bingoId: bingo.bingoId,
      requester,
    });

    await expect(handler.execute(query)).rejects.toThrow(ForbiddenException);
  });

  it('return the user activities if the user is not participant but moderator', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoActivitiesQuery({
      bingoId: bingo.bingoId,
      requester,
    });

    await expect(handler.execute(query)).resolves.not.toThrow();
  });

  it('return the user activities if the user is an organizer', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const query = new SearchBingoActivitiesQuery({
      bingoId: bingo.bingoId,
      requester,
    });

    await expect(handler.execute(query)).resolves.not.toThrow();
  });
});
