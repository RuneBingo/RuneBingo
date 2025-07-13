import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v4 } from 'uuid';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { BingoParticipant } from '../bingo-participant.entity';
import { KickBingoParticipantCommand, KickBingoParticipantHandler } from './kick-bingo-participant.command';
import { BingoParticipantKickedEvent } from '../events/bingo-participant-kicked.event';

describe('KickBingoParticipantHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: KickBingoParticipantHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        configModule,
        dbModule,
        i18nModule,
        TypeOrmModule.forFeature([Bingo, User, BingoParticipant, BingoTeam]),
      ],
      providers: [
        KickBingoParticipantHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(KickBingoParticipantHandler);
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

  it('throws NotFoundException if the bingo is not found', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingoId = v4(); // I swear, if this test fails, I should buy a lottery ticket
    const userToUpdate = seedingService.getEntity(User, 'dee420');

    const command = new KickBingoParticipantCommand({
      requester,
      bingoId,
      username: userToUpdate.usernameNormalized,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException if the participant is not found', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToUpdate = 'non-existent-username';

    const command = new KickBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the requester is a participant but not an organizer', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToUpdate = seedingService.getEntity(User, 'didiking');

    const command = new KickBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate.usernameNormalized,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if the requester is an organizer trying to kick the bingo owner', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const userToUpdate = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new KickBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate.usernameNormalized,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('deletes the participant from the bingo and emits a BingoParticipantKickedEvent', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const userToUpdate = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new KickBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate.usernameNormalized,
    });

    await handler.execute(command);

    const bingoParticipant = (await bingo.participants).find((participant) => participant.userId === userToUpdate.id);
    expect(bingoParticipant).toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoParticipantKickedEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        userId: userToUpdate.id,
        deletedTileCompletions: false,
      }),
    );
  });

  it('removes the participant as a team captain in teams where they are a captain of', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const userToUpdate = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const team = seedingService.getEntity(BingoTeam, 'les-machos');

    const command = new KickBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate.usernameNormalized,
    });

    await handler.execute(command);

    const teamCaptain = await team.captain;
    expect(teamCaptain).toBeNull();
  });
});
