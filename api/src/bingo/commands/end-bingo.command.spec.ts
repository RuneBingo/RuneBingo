import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { DataSource } from 'typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { EndBingoCommand, EndBingoHandler } from './end-bingo.command';
import { BingoStatus } from '../bingo-status.enum';
import { Bingo } from '../bingo.entity';
import { BingoEndedEvent } from '../events/bingo-ended.event';
import { BingoParticipant } from '../participant/bingo-participant.entity';
import { BingoTile } from '../tile/bingo-tile.entity';

describe('EndBingoHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: EndBingoHandler;
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
        EndBingoHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(EndBingoHandler);
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

    const command = new EndBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the requester is not a participant or a moderator', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const bingo = seedingService.getEntity(Bingo, 'started-bingo');

    const command = new EndBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException if the bingo is not ongoing', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'ready_bingo');

    const command = new EndBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('ends the bingo and emits a BingoEndedEvent', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'started-bingo');

    const endDate = format(new Date(), 'yyyy-MM-dd');

    const command = new EndBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    const startedBingo = await handler.execute(command);
    expect(startedBingo).toBeDefined();
    expect(startedBingo.status).toBe(BingoStatus.Completed);
    expect(startedBingo.endDate).toBe(endDate);
    expect(startedBingo.endedAt).toBeDefined();
    expect(startedBingo.endedById).toBe(requester.id);
    await expect(startedBingo.updatedBy).resolves.toBe(requester);
    await expect(startedBingo.endedBy).resolves.toBe(requester);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoEndedEvent({ bingoId: bingo.id, requesterId: requester.id, early: true }),
    );
  });
});
