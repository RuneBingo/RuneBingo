import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

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
import { CreateOrEditBingoTileCommand, CreateOrEditBingoTileCommandHandler } from './create-or-edit-bingo-tile.command';
import { BingoTileCompletionMode } from '../bingo-tile-completion-mode.enum';
import { BingoTileSetEvent } from '../events/bingo-tile-set.event';

describe('CreateOrEditBingoTileCommandHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: CreateOrEditBingoTileCommandHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        configModule,
        dbModule,
        i18nModule,
        TypeOrmModule.forFeature([Bingo, User, BingoParticipant, BingoTile, BingoTileItem, Media, OsrsItem]),
      ],
      providers: [
        CreateOrEditBingoTileCommandHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(CreateOrEditBingoTileCommandHandler);
    eventBus = module.get(EventBus);
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

  it('throws NotFoundException if the requester is not allowed to see the bingo', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
      data: {
        title: 'New title',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the requester is not an organizer or a moderator', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
      data: {
        title: 'New title',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if the requester is not a moderator and the bingo is not pending', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'started-bingo');

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
      data: {
        title: 'New title',
      },
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

    const invalidXCommand = new CreateOrEditBingoTileCommand({ ...baseParams, x: 6 });
    const invalidYCommand = new CreateOrEditBingoTileCommand({ ...baseParams, y: 6 });
    const invalidXYCommand = new CreateOrEditBingoTileCommand({ ...baseParams, x: 6, y: 6 });

    await expect(handler.execute(invalidXCommand)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(invalidYCommand)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(invalidXYCommand)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when creating a new tile with missing required fields', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
      data: {
        title: 'New title',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException if the media is not found', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
      data: {
        mediaId: 'non-existent-media-id',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException if one of the provided items is not found', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
      data: {
        items: [{ itemId: 69420, quantity: 1 }],
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException if one of the provided items is disabled', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');
    const item = seedingService.getEntity(OsrsItem, 'disabled_item');

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
      data: {
        items: [{ itemId: item.id, quantity: 1 }],
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('creates a new tile and publishes a bingo tile set event successfully', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
      data: {
        title: 'New title',
        description: 'New description',
        value: 100,
        free: false,
        completionMode: BingoTileCompletionMode.All,
        items: [{ itemId: 4151, quantity: 1 }],
      },
    });

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.title).toBe('New title');
    expect(result.description).toBe('New description');
    expect(result.value).toBe(100);
    expect(result.free).toBe(false);
    expect(result.completionMode).toBe(BingoTileCompletionMode.All);
    expect(await result.items).toHaveLength(1);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoTileSetEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        x: 5,
        y: 5,
        title: 'New title',
        description: 'New description',
        value: 100,
        free: false,
        completionMode: BingoTileCompletionMode.All,
        items: [{ itemId: 4151, quantity: 1 }],
      }),
    );
  });

  it('updates an existing tile successfully', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');
    const tileItemsLength = (await tile.items)?.length;

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
      data: {
        title: 'New title',
        description: 'New description',
        value: 100,
        free: false,
        completionMode: BingoTileCompletionMode.Any,
        // Items is not provided, so it should not be updated
      },
    });

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.title).toBe('New title');
    expect(result.description).toBe('New description');
    expect(result.value).toBe(100);
    expect(result.free).toBe(false);
    expect(result.completionMode).toBe(BingoTileCompletionMode.Any);
    expect((await result.items)?.length).toBe(tileItemsLength);
  });

  it('removes all items from a tile if an empty items array is provided', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const tile = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: tile.x,
      y: tile.y,
      data: {
        items: [],
      },
    });

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(await result.items).toHaveLength(0);
  });

  it('removes items that are not present in the new items array, as well as creates or updates the ones that are present', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 4,
      y: 1,
      data: {
        items: [{ itemId: 6731, quantity: 3 }],
      },
    });

    const result = await handler.execute(command);
    const resultItems = await result.items;

    expect(result).toBeDefined();
    expect(resultItems?.length).toBe(1);
    expect(resultItems?.[0]?.osrsItemId).toBe(6731);
    expect(resultItems?.[0]?.quantity).toBe(3);
  });

  it('allows moderators to bypass the status restriction', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'started-bingo');

    const command = new CreateOrEditBingoTileCommand({
      requester,
      bingoId: bingo.bingoId,
      x: 5,
      y: 5,
      data: {
        title: 'New title',
        description: 'New description',
        value: 100,
        free: false,
        completionMode: BingoTileCompletionMode.All,
        items: [{ itemId: 4151, quantity: 1 }],
      },
    });

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.title).toBe('New title');
    expect(result.description).toBe('New description');
    expect(result.value).toBe(100);
  });
});
