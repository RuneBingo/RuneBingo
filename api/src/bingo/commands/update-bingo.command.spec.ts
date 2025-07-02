import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { UpdateBingoCommand, UpdateBingoHandler } from './update-bingo.command';
import { BingoStatus } from '../bingo-status.enum';
import { BingoUpdatedEvent } from '../events/bingo-updated.event';
import { BingoTile } from '../tile/bingo-tile.entity';

describe('UpdateBingoHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: UpdateBingoHandler;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        configModule,
        dbModule,
        i18nModule,
        TypeOrmModule.forFeature([Bingo, BingoTile, User, BingoParticipant]),
      ],
      providers: [
        UpdateBingoHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(UpdateBingoHandler);
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

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        title: 'New title',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequest if the end date is before the start date', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        endDate: '2025-03-01',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequest if the start date is after the end date during same update', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        startDate: '2025-04-10',
        endDate: '2025-04-05',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequest if the start date is after the end date', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        startDate: '2025-05-01',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequest if the registration date is after the start date', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        maxRegistrationDate: '2025-04-10',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequest if the registration date is after the start date during the same update', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        startDate: '2025-03-05',
        maxRegistrationDate: '2025-03-25',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('updates the bingo user has at least moderator and emits UpdatedBingo event', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        description: 'Test description',
      },
    });

    const toUpdate = await handler.execute(command);
    expect(toUpdate).toBeDefined();
    expect(toUpdate.title).toBe('OSRS QC');
    expect(toUpdate.description).toBe('Test description');
    expect(toUpdate.private).toBe(true);
    expect(toUpdate.width).toBe(5);
    expect(toUpdate.createdById).toBe(1);
    expect(toUpdate.height).toBe(5);
    expect(toUpdate.fullLineValue).toBe(100);
    expect(toUpdate.startDate).toBe('2025-04-01');
    expect(toUpdate.endDate).toBe('2025-04-30');
    expect(toUpdate.language).toBe('en');
    expect(toUpdate.isDeleted).toBe(false);
    expect(toUpdate.createdAt).toBeDefined();
    expect(toUpdate.updatedAt).toBeDefined();
    expect(toUpdate.updatedById).toBe(requester.id);
    expect(toUpdate.maxRegistrationDate).toBe('2025-03-31');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoUpdatedEvent({
        bingoId: toUpdate.id,
        requesterId: requester.id,
        updates: {
          description: toUpdate.description,
        },
      }),
    );
  });

  it('updates the bingo if user is at least organizer', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        description: 'Test description',
      },
    });

    const toUpdate = await handler.execute(command);
    expect(toUpdate).toBeDefined();
    expect(toUpdate.title).toBe('OSRS QC');
    expect(toUpdate.description).toBe('Test description');
    expect(toUpdate.private).toBe(true);
    expect(toUpdate.width).toBe(5);
    expect(toUpdate.createdById).toBe(1);
    expect(toUpdate.height).toBe(5);
    expect(toUpdate.fullLineValue).toBe(100);
    expect(toUpdate.startDate).toBe('2025-04-01');
    expect(toUpdate.endDate).toBe('2025-04-30');
    expect(toUpdate.language).toBe('en');
    expect(toUpdate.isDeleted).toBe(false);
    expect(toUpdate.createdAt).toBeDefined();
    expect(toUpdate.updatedAt).toBeDefined();
    expect(toUpdate.updatedById).toBe(requester.id);
    expect(toUpdate.maxRegistrationDate).toBe('2025-03-31');
  });

  it('throws ForbiddenException if the requester is a bingo participant without organizer role', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        title: 'New title',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws NotFound if the bingo is not found', async () => {
    const requester = seedingService.getEntity(User, 'dee420');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: uuidV4(),
      updates: {
        title: 'New title',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should update every value', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        title: 'Mon bingo',
        language: 'fr',
        description: 'My custom bingo',
        private: false,
        fullLineValue: 25,
        startDate: '2025-01-01',
        endDate: '2025-02-01',
        maxRegistrationDate: '2024-12-31',
      },
    });

    const toUpdate = await handler.execute(command);
    expect(toUpdate).toBeDefined();
    expect(toUpdate.title).toBe('Mon bingo');
    expect(toUpdate.description).toBe('My custom bingo');
    expect(toUpdate.private).toBe(false);
    expect(toUpdate.width).toBe(5);
    expect(toUpdate.createdById).toBe(1);
    expect(toUpdate.height).toBe(5);
    expect(toUpdate.fullLineValue).toBe(25);
    expect(toUpdate.startDate).toBe('2025-01-01');
    expect(toUpdate.endDate).toBe('2025-02-01');
    expect(toUpdate.language).toBe('fr');
    expect(toUpdate.isDeleted).toBe(false);
    expect(toUpdate.createdAt).toBeDefined();
    expect(toUpdate.updatedAt).toBeDefined();
    expect(toUpdate.updatedById).toBe(requester.id);
    expect(toUpdate.maxRegistrationDate).toBe('2024-12-31');
  });

  it('allows organizer to update fields that require organizer role', async () => {
    const requester = seedingService.getEntity(User, 'didiking'); // organizer
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        title: 'Organizer Update',
      },
    });

    const result = await handler.execute(command);
    expect(result.title).toBe('Organizer Update');
  });

  it('allows owner to update fields that require organizer role', async () => {
    const requester = seedingService.getEntity(User, 'char0o'); // owner
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        title: 'Owner Update',
      },
    });

    const result = await handler.execute(command);
    expect(result.title).toBe('Owner Update');
  });

  it('allows moderator to bypass organizer role requirement', async () => {
    const requester = seedingService.getEntity(User, 'zezima'); // moderator
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        title: 'Moderator Update',
        description: 'Moderator description',
        language: 'fr',
        private: false,
        startDate: '2025-05-01',
        endDate: '2025-05-31',
        maxRegistrationDate: '2025-04-30',
        fullLineValue: 75,
        width: 7,
        height: 7,
      },
    });

    const result = await handler.execute(command);
    expect(result.title).toBe('Moderator Update');
    expect(result.description).toBe('Moderator description');
    expect(result.language).toBe('fr');
    expect(result.private).toBe(false);
    expect(result.startDate).toBe('2025-05-01');
    expect(result.endDate).toBe('2025-05-31');
    expect(result.maxRegistrationDate).toBe('2025-04-30');
    expect(result.fullLineValue).toBe(75);
    expect(result.width).toBe(7);
    expect(result.height).toBe(7);
  });

  it('allows moderator to update even when not a participant', async () => {
    const requester = seedingService.getEntity(User, 'zezima'); // moderator, not participant
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        title: 'Moderator Update Without Participation',
      },
    });

    const result = await handler.execute(command);
    expect(result.title).toBe('Moderator Update Without Participation');
  });

  it('throws ForbiddenException when trying to update non-existent field', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        // @ts-expect-error - Testing invalid field
        invalidField: 'value',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when trying to update non-updatable field', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        // @ts-expect-error - Testing non-updatable field
        bingoId: 'new-id',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when one field is invalid in mixed update', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new UpdateBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      updates: {
        title: 'Valid Update',
        // @ts-expect-error - Testing invalid field in mixed update
        invalidField: 'value',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  describe('when the bingo size is changed', () => {
    it('throws ConflictException if tiles would be deleted and no confirmation is provided', async () => {
      const requester = seedingService.getEntity(User, 'char0o');
      const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

      const command = new UpdateBingoCommand({
        requester,
        bingoId: bingo.bingoId,
        updates: {
          width: 3,
        },
      });

      await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    });

    it('only deletes tiles that are outside of the new size', async () => {
      const requester = seedingService.getEntity(User, 'char0o');
      const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
      const tileToKeep = seedingService.getEntity(BingoTile, 'osrs-qc_3-1');
      const tileToDelete = seedingService.getEntity(BingoTile, 'osrs-qc_4-1');

      const command = new UpdateBingoCommand({
        requester,
        bingoId: bingo.bingoId,
        updates: {
          width: 3,
          confirmTileDeletion: true,
        },
      });

      await handler.execute(command);

      const updatedBingo = await dataSource.manager.findOne(Bingo, {
        where: { id: bingo.id },
        relations: ['tiles'],
      });

      expect(updatedBingo).toBeDefined();
      expect(updatedBingo!.width).toBe(3);
      expect(updatedBingo!.height).toBe(bingo.height);

      const tiles = await updatedBingo!.tiles;
      expect(tiles.find((tile) => tile.id === tileToDelete.id)).toBeUndefined();
      expect(tiles.find((tile) => tile.id === tileToKeep.id)).toBeDefined();
    });
  });

  const BINGO_AND_FIELDS_TO_TEST_BY_STATUS = {
    [BingoStatus.Ongoing]: {
      bingo: 'started-bingo',
      fields: ['language', 'private', 'startDate', 'maxRegistrationDate', 'width', 'height', 'fullLineValue'],
    },
    [BingoStatus.Completed]: {
      bingo: 'ended-bingo',
      fields: [
        'language',
        'title',
        'description',
        'private',
        'startDate',
        'endDate',
        'maxRegistrationDate',
        'width',
        'height',
        'fullLineValue',
      ],
    },
    [BingoStatus.Canceled]: {
      bingo: 'canceled-bingo',
      fields: [
        'language',
        'title',
        'description',
        'private',
        'startDate',
        'endDate',
        'maxRegistrationDate',
        'width',
        'height',
        'fullLineValue',
      ],
    },
  };

  Object.entries(BINGO_AND_FIELDS_TO_TEST_BY_STATUS).forEach(([status, { bingo: bingoKey, fields }]) => {
    describe(`when the bingo is ${status}`, () => {
      fields.forEach((field) => {
        it(`throws BadRequestException when trying to update ${field}`, async () => {
          const requester = seedingService.getEntity(User, 'char0o');
          const bingo = seedingService.getEntity(Bingo, bingoKey);

          const command = new UpdateBingoCommand({
            requester,
            bingoId: bingo.bingoId,
            updates: {
              [field]: 'value',
            },
          });

          await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
        });
      });
    });
  });
});
