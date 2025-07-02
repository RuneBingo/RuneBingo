import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { Media } from '@/media/media.entity';
import { OsrsItem } from '@/osrs/item/osrs-item.entity';
import { User } from '@/user/user.entity';

import { BingoTileItem } from '../bingo-tile-item';
import { BingoTile } from '../bingo-tile.entity';
import { DeleteBingoTileCommand, DeleteBingoTileCommandHandler } from './delete-bingo-tile.command';
import { BingoTileDeletedEvent } from '../events/bingo-tile-deleted.event';

describe('DeleteBingoTileCommandHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: DeleteBingoTileCommandHandler;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        configModule,
        dbModule,
        i18nModule,
        TypeOrmModule.forFeature([Bingo, User, BingoParticipant, BingoTile, BingoTileItem, Media, OsrsItem]),
      ],
      providers: [
        DeleteBingoTileCommandHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(DeleteBingoTileCommandHandler);
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

    const command = new DeleteBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the requester is not an organizer or a moderator', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new DeleteBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if the requester is not a moderator and the bingo is not pending', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'started-bingo');

    const command = new DeleteBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException if the coordinates are out of bounds', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const baseParams = {
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
      data: {
        title: 'New title',
      },
    };

    const invalidXCommand = new DeleteBingoTileCommand({ ...baseParams, x: 6 });
    const invalidYCommand = new DeleteBingoTileCommand({ ...baseParams, y: 6 });
    const invalidXYCommand = new DeleteBingoTileCommand({ ...baseParams, x: 6, y: 6 });

    await expect(handler.execute(invalidXCommand)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(invalidYCommand)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(invalidXYCommand)).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException if the tile does not exist', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new DeleteBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('deletes the tile and publishes a bingo tile deleted event successfully', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');

    const command = new DeleteBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
    });

    await handler.execute(command);

    const bingoTile = await dataSource.getRepository(BingoTile).findOneBy({ id: tile.id });
    expect(bingoTile).toBeNull();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoTileDeletedEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        x: tile.x,
        y: tile.y,
      }),
    );
  });
});
