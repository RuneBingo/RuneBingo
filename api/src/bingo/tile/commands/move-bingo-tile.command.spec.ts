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
import { MoveBingoTileCommand, MoveBingoTileCommandHandler } from './move-bingo-tile.command';
import { BingoTileMovedEvent } from '../events/bingo-tile-moved.event';

describe('MoveBingoTileCommandHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: MoveBingoTileCommandHandler;
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
        MoveBingoTileCommandHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(MoveBingoTileCommandHandler);
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
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');

    const command = new MoveBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
      toX: 4,
      toY: 5,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the requester is not an organizer or a moderator', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');

    const command = new MoveBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
      toX: 4,
      toY: 5,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if the requester is not a moderator and the bingo is not pending', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'started-bingo');

    const command = new MoveBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 1,
      y: 1,
      toX: 4,
      toY: 5,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException if the coordinates are out of bounds', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');

    const baseParams = {
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
      toX: 5,
      toY: 5,
    };

    const invalidXCommand = new MoveBingoTileCommand({ ...baseParams, toX: 6 });
    const invalidYCommand = new MoveBingoTileCommand({ ...baseParams, toY: 6 });
    const invalidXYCommand = new MoveBingoTileCommand({ ...baseParams, toX: 6, toY: 6 });

    await expect(handler.execute(invalidXCommand)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(invalidYCommand)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(invalidXYCommand)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException if the new coordinates are the same as the current coordinates', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');

    const command = new MoveBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
      toX: tile.x,
      toY: tile.y,
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException if the tile does not exist', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new MoveBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
      toX: 4,
      toY: 5,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('moves the tile and publishes a bingo tile moved event successfully', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');

    const command = new MoveBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
      toX: 4,
      toY: 5,
    });

    await handler.execute(command);

    const bingoTile = await dataSource.getRepository(BingoTile).findOneBy({ id: tile.id });
    expect(bingoTile).toBeDefined();
    expect(bingoTile!.x).toBe(4);
    expect(bingoTile!.y).toBe(5);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoTileMovedEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        x: tile.x,
        y: tile.y,
        toX: 4,
        toY: 5,
        swapped: false,
      }),
    );
  });

  it('swaps the tile with the target tile if both tiles are occupied', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');
    const targetTile = seedingService.getEntity(BingoTile, 'osrs-qc_4-1');

    const command = new MoveBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
      toX: targetTile.x,
      toY: targetTile.y,
    });

    await handler.execute(command);

    const bingoTile = await dataSource.getRepository(BingoTile).findOneBy({ id: tile.id });
    expect(bingoTile).toBeDefined();
    expect(bingoTile!.x).toBe(targetTile.x);
    expect(bingoTile!.y).toBe(targetTile.y);

    const targetBingoTile = await dataSource.getRepository(BingoTile).findOneBy({ id: targetTile.id });
    expect(targetBingoTile).toBeDefined();
    expect(targetBingoTile!.x).toBe(tile.x);
    expect(targetBingoTile!.y).toBe(tile.y);

    const movedBingoTile = await dataSource.getRepository(BingoTile).findOneBy({ id: tile.id });
    expect(movedBingoTile).toBeDefined();
    expect(movedBingoTile!.x).toBe(targetTile.x);
    expect(movedBingoTile!.y).toBe(targetTile.y);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoTileMovedEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        x: tile.x,
        y: tile.y,
        toX: targetTile.x,
        toY: targetTile.y,
        swapped: true,
      }),
    );
  });
});
