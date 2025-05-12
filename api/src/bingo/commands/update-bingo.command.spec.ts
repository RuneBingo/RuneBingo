import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { UpdateBingoCommand, UpdateBingoHandler } from './update-bingo.command';
import { Bingo } from '../bingo.entity';
import { BingoUpdatedEvent } from '../events/bingo-updated.event';
import { v4 as uuidV4 } from 'uuid';

describe('UpdateBingoHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: UpdateBingoHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Bingo, User, BingoParticipant])],
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
});
