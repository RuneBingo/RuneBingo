import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { type TestingModule, Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { DeleteBingoCommand, DeleteBingoHandler } from './delete-bingo.command';
import { BingoDeletedEvent } from '../events/bingo-deleted.event';
import { v4 as uuidV4 } from 'uuid';

describe('DeleteBingoHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: DeleteBingoHandler;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Bingo, User, BingoParticipant])],
      providers: [
        DeleteBingoHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(DeleteBingoHandler);
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

  it('throws ForbiddenException if the requester is not a participant or a moderator', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new DeleteBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if the requester is a bingo participant without owner role', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new DeleteBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws NotFound if the bingo doesnt exist', async () => {
    const requester = seedingService.getEntity(User, 'dee420');

    const command = new DeleteBingoCommand({
      requester,
      bingoId: uuidV4(),
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFound if the bingo is already deleted', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'deleted-bingo');

    const command = new DeleteBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('deletes the bingo if user at least moderator and emits DeletedBingo event', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new DeleteBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    const toDelete = await handler.execute(command);
    expect(toDelete).toBeDefined();
    expect(toDelete.deletedAt).toBeDefined();
    expect(toDelete.deletedById).toBe(requester.id);

    const updatedBingoParticipants = await dataSource.getRepository(BingoParticipant).find({
      where: {
        bingoId: bingo.id,
      }
    });
    expect(updatedBingoParticipants.length).toBe(0);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoDeletedEvent({
        bingoId: toDelete.id,
        requesterId: requester.id,
      }),
    );
  });

  it('deletes the bingo if user is owner', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'german-osrs');

    const command = new DeleteBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    const toDelete = await handler.execute(command);
    expect(toDelete).toBeDefined();
    expect(toDelete.deletedAt).toBeDefined();
    expect(toDelete.deletedById).toBe(requester.id);

  });
});
