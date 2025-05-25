import { ConflictException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { AddBingoParticipantCommand, AddBingoParticipantHandler } from './add-bingo-participant.command';
import { BingoParticipant } from '../bingo-participant.entity';
import { BingoParticipantAddedEvent } from '../events/bingo-participant-added.event';
import { BingoRoles } from '../roles/bingo-roles.constants';

describe('AddBingoParticipantHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: AddBingoParticipantHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([BingoParticipant])],
      providers: [
        AddBingoParticipantHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(AddBingoParticipantHandler);
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

  it('adds a new bingo participant and emits a new add bingoParticipant event', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToAdd = seedingService.getEntity(User, 'b0aty');
    const expectedRole = BingoRoles.Participant;

    const command = new AddBingoParticipantCommand({
      requester,
      bingo,
      user: userToAdd,
      role: expectedRole,
    });

    const bingoParticipant = await handler.execute(command);

    expect(bingoParticipant).toBeDefined();
    expect(bingoParticipant.bingoId).toBe(bingo.id);
    expect(bingoParticipant.userId).toBe(userToAdd.id);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoParticipantAddedEvent({
        bingoId: bingo.id,
        requesterId: requester.id,
        userId: userToAdd.id,
        role: expectedRole,
      }),
    );
  });

  it('throws conflictexception if the user is already a participant', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToAdd = seedingService.getEntity(User, 'char0o');
    const expectedRole = BingoRoles.Participant;

    const command = new AddBingoParticipantCommand({
      requester,
      bingo,
      user: userToAdd,
      role: expectedRole,
    });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });
});
