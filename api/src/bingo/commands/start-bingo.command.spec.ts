import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { addMonths, format, subDays } from 'date-fns';
import { DataSource } from 'typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { StartBingoCommand, StartBingoHandler } from './start-bingo.command';
import { BingoStatus } from '../bingo-status.enum';
import { Bingo } from '../bingo.entity';
import { BingoStartedEvent } from '../events/bingo-started.event';
import { BingoParticipant } from '../participant/bingo-participant.entity';
import { BingoRoles } from '../participant/roles/bingo-roles.constants';
import { BingoTile } from '../tile/bingo-tile.entity';

describe('StartBingoHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: StartBingoHandler;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        configModule,
        dbModule,
        i18nModule,
        TypeOrmModule.forFeature([Bingo, BingoParticipant, BingoTile, User]),
      ],
      providers: [
        StartBingoHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(StartBingoHandler);
    eventBus = module.get(EventBus);
    seedingService = module.get(SeedingService);
    dataSource = module.get(DataSource);
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

  it('throws NotFoundException if the requester is not allowed to see the bingo', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new StartBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the requester is not a participant or a moderator', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const bingo = seedingService.getEntity(Bingo, 'ready_bingo');

    const command = new StartBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException if the bingo is not pending', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'started-bingo');

    const command = new StartBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException if the end date is in the past', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'ready_bingo');

    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    await dataSource.manager.update(Bingo, bingo.id, { endDate: yesterday });

    const command = new StartBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException if not all tiles are present', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const endDate = format(addMonths(new Date(), 1), 'yyyy-MM-dd');
    const command = new StartBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      endDate,
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException if not all participants are assigned to a team', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'ready_bingo');
    const user = seedingService.getEntity(User, 'zezima');

    await dataSource.manager.insert(BingoParticipant, {
      userId: user.id,
      bingoId: bingo.id,
      role: BingoRoles.Participant,
    });

    const command = new StartBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('starts the bingo and emits a BingoStartedEvent', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'ready_bingo');

    const startDate = format(new Date(), 'yyyy-MM-dd');
    const endDate = format(addMonths(new Date(), 1), 'yyyy-MM-dd');

    const command = new StartBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      endDate,
    });

    const startedBingo = await handler.execute(command);
    expect(startedBingo).toBeDefined();
    expect(startedBingo.status).toBe(BingoStatus.Ongoing);
    expect(startedBingo.endDate).toBe(endDate);
    expect(startedBingo.startDate).toBe(startDate);
    expect(startedBingo.startedAt).toBeDefined();
    expect(startedBingo.startedById).toBe(requester.id);
    await expect(startedBingo.updatedBy).resolves.toBe(requester);
    await expect(startedBingo.startedBy).resolves.toBe(requester);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoStartedEvent({ bingoId: bingo.id, requesterId: requester.id, endDate, early: true }),
    );
  });
});
