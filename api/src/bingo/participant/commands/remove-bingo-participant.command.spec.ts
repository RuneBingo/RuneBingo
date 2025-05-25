import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { Bingo } from '@/bingo/bingo.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { BingoParticipant } from '../bingo-participant.entity';
import { RemoveBingoParticipantCommand, RemoveBingoParticipantHandler } from './remove-bingo-participant.command';
import { BingoParticipantRemovedEvent } from '../events/bingo-participant-removed.event';
import { BingoRoles } from '../roles/bingo-roles.constants';

describe('AddBingoParticipantHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: RemoveBingoParticipantHandler;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Bingo, User, BingoParticipant])],
      providers: [
        RemoveBingoParticipantHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(RemoveBingoParticipantHandler);
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

  it('removes a bingo participant if organizer and emits a BingoParticipantRemoved event', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToRemove = seedingService.getEntity(User, 'dee420');
    const expectedParticipantRole = BingoRoles.Participant;

    const command = new RemoveBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToRemove.usernameNormalized,
    });

    await handler.execute(command);

    const participant = await dataSource
      .getRepository(BingoParticipant)
      .findOneBy({ bingoId: bingo.id, userId: userToRemove.id });

    expect(participant).toBeNull();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoParticipantRemovedEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        userId: userToRemove.id,
        role: expectedParticipantRole,
      }),
    );
  });

  it('removes a bingo participant if user is a moderator and not a participant', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const bingo = seedingService.getEntity(Bingo, 'german-osrs');
    const userToRemove = seedingService.getEntity(User, 'didiking');

    const command = new RemoveBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToRemove.usernameNormalized,
    });

    await handler.execute(command);

    const participant = await dataSource
      .getRepository(BingoParticipant)
      .findOneBy({ bingoId: bingo.id, userId: userToRemove.id });

    expect(participant).toBeNull();
  });

  it('removes a bingo participant is self', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToRemove = seedingService.getEntity(User, 'dee420');

    const command = new RemoveBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToRemove.usernameNormalized,
    });

    await handler.execute(command);

    const participant = await dataSource
      .getRepository(BingoParticipant)
      .findOneBy({ bingoId: bingo.id, userId: userToRemove.id });

    expect(participant).toBeNull();
  });

  it('throws forbidden exception if participant is kicking someone else and not at least organizer', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToRemove = seedingService.getEntity(User, 'char0o');

    const command = new RemoveBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToRemove.usernameNormalized,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws not found if bingo doesnt exist', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const userToRemove = seedingService.getEntity(User, 'char0o');

    const command = new RemoveBingoParticipantCommand({
      requester,
      bingoId: uuidV4(),
      username: userToRemove.usernameNormalized,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws not found if user is not a participant', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToRemove = seedingService.getEntity(User, 'b0aty');

    const command = new RemoveBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToRemove.usernameNormalized,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws not found if user doesnt exist', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new RemoveBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: 'I dont exist',
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
