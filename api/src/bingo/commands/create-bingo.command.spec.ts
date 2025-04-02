import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { CreateBingoCommand, CreateBingoHandler } from './create-bingo.command';
import { Bingo } from '../bingo.entity';
import { BingoCreatedEvent } from '../events/bingo-created.event';

describe('CreateBingoHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: CreateBingoHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Bingo])],
      providers: [
        CreateBingoHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(CreateBingoHandler);
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

  it('throws ForbiddenException if title is already in use', async () => {
    const requester = seedingService.getEntity(User, 'raph');

    const command = new CreateBingoCommand({
      requester: requester,
      language: 'en',
      title: 'OSRS QC',
      description: 'Les quebec',
      isPrivate: false,
      width: 5,
      height: 5,
      fullLineValue: 100,
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      maxRegistrationDate: '2024-03-21',
    });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });

  it('throws ForbiddenException if user already has an active bingo', async () => {
    const requester = seedingService.getEntity(User, 'char0o');

    const command = new CreateBingoCommand({
      requester: requester,
      language: 'en',
      title: 'My bingo',
      description: 'Les quebec',
      isPrivate: false,
      width: 5,
      height: 5,
      fullLineValue: 100,
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      maxRegistrationDate: '2024-03-21',
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequest if the start date is after the end date', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');

    const command = new CreateBingoCommand({
      requester: requester,
      language: 'en',
      title: 'My bingo',
      description: 'Les quebec',
      isPrivate: false,
      width: 5,
      height: 5,
      fullLineValue: 100,
      startDate: '2025-05-01',
      endDate: '2025-04-30',
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequest if the max registration date is after the start date', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');

    const command = new CreateBingoCommand({
      requester: requester,
      language: 'en',
      title: 'My bingo',
      description: 'Les quebec',
      isPrivate: false,
      width: 5,
      height: 5,
      fullLineValue: 100,
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      maxRegistrationDate: '2025-04-10',
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('creates a new bingo and emits a BingoCreatedEvent', async () => {
    const requester = seedingService.getEntity(User, 'zezima');

    const command = new CreateBingoCommand({
      requester: requester,
      language: 'en',
      title: 'Raph bingo',
      description: 'Les quebec',
      isPrivate: false,
      width: 5,
      height: 5,
      fullLineValue: 100,
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      maxRegistrationDate: '2024-03-21',
    });
    const bingo = await handler.execute(command);

    expect(bingo).toBeDefined();
    expect(bingo.title).toBe('Raph bingo');
    expect(bingo.slug).toBe('raph-bingo');
    expect(bingo.description).toBe('Les quebec');
    expect(bingo.private).toBe(false);
    expect(bingo.width).toBe(5);
    expect(bingo.createdById).toBe(requester.id);
    expect(bingo.height).toBe(5);
    expect(bingo.fullLineValue).toBe(100);
    expect(bingo.startDate).toBe('2025-04-01');
    expect(bingo.endDate).toBe('2025-04-30');
    expect(bingo.language).toBe('en');
    expect(bingo.isDeleted).toBe(false);
    expect(bingo.createdAt).toBeDefined();
    expect(bingo.updatedAt).toBeDefined();
    expect(bingo.maxRegistrationDate).toBe('2024-03-21');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoCreatedEvent({
        bingoId: bingo.id,
        requesterId: requester.id,
        language: bingo.language,
        title: bingo.title,
        description: bingo.description,
        private: bingo.private,
        width: bingo.width,
        height: bingo.height,
        fullLineValue: bingo.fullLineValue,
        startDate: bingo.startDate,
        endDate: bingo.endDate,
      }),
    );
  });

  // Uncomment once the slug unique index is fixed
  /*
  it('creates a new bingo even tho slug collides with deleted bingo', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');

    const command = new CreateBingoCommand({
      requester: requester,
      language: 'en',
      title: 'Deleted bingo',
      description: 'Les quebec',
      isPrivate: false,
      width: 5,
      height: 5,
      fullLineValue: 100,
      startDate: '2025-04-01',
      endDate: '2025-04-30',
    });
    const bingo = await handler.execute(command);

    expect(bingo).toBeDefined();
    expect(bingo.title).toBe('Deleted bingo');
    expect(bingo.slug).toBe('deleted-bingo');
    expect(bingo.description).toBe('Les quebec');
    expect(bingo.private).toBe(false);
    expect(bingo.width).toBe(5);
    expect(bingo.createdById).toBe(requester.id);
    expect(bingo.height).toBe(5);
    expect(bingo.fullLineValue).toBe(100);
    expect(bingo.startDate).toBe('2025-04-01');
    expect(bingo.endDate).toBe('2025-04-30');
    expect(bingo.language).toBe('en');
    expect(bingo.isDeleted).toBe(false);
    expect(bingo.createdAt).toBeDefined();
    expect(bingo.updatedAt).toBeDefined();
    expect(bingo.maxRegistrationDate).toBeNull();
  });*/
});
