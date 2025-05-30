import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { Session } from '../session.entity';
import { SetSessionCurrentBingoCommand, SetSessionCurrentBingoHandler } from './set-session-current-bingo.command';

describe('SetSessionCurrentBingoCommand', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let handler: SetSessionCurrentBingoHandler;
  let queryBus: QueryBus;

  beforeAll(async () => {
    const queryBusMock = {
      execute: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Session])],
      providers: [SetSessionCurrentBingoHandler, SeedingService, { provide: QueryBus, useValue: queryBusMock }],
    }).compile();

    handler = module.get(SetSessionCurrentBingoHandler);
    queryBus = module.get(QueryBus);
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

  it('throws NotFoundException if the session is not found', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new SetSessionCurrentBingoCommand({
      uuid: '00000000-0000-0000-0000-000000000000',
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the session is signed out', async () => {
    const session = seedingService.getEntity(Session, 'zezima_signed_out_session_01');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new SetSessionCurrentBingoCommand({
      uuid: session.uuid,
      requester: await session.user,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if the requester is not and admin and not the same as the session user', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const session = seedingService.getEntity(Session, 'zezima_active_session_01');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new SetSessionCurrentBingoCommand({
      uuid: session.uuid,
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws NotFoundException if the bingo does not exist or the user is not participating in it', async () => {
    const session = seedingService.getEntity(Session, 'zezima_active_session_01');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    (queryBus.execute as jest.Mock).mockResolvedValue(null);

    const command = new SetSessionCurrentBingoCommand({
      uuid: session.uuid,
      requester: await session.user,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('sets the current bingo for the session', async () => {
    const session = seedingService.getEntity(Session, 'didiking_active_session_01');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    (queryBus.execute as jest.Mock).mockResolvedValue(bingo);

    const command = new SetSessionCurrentBingoCommand({
      uuid: session.uuid,
      requester: await session.user,
      bingoId: bingo.bingoId,
    });

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result?.currentBingoId).toBe(bingo.id);
  });
});
