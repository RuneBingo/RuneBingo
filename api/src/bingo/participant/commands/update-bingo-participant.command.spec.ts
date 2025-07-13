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
import { UpdateBingoParticipantCommand, UpdateBingoParticipantHandler } from './update-bingo-participant.command';
import { BingoParticipantUpdatedEvent } from '../events/bingo-participant-updated.event';
import { BingoRoles } from '../roles/bingo-roles.constants';

describe('UpdateBingoParticipantHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: UpdateBingoParticipantHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        configModule,
        dbModule,
        i18nModule,
        TypeOrmModule.forFeature([Bingo, User, BingoParticipant, BingoTeam]),
      ],
      providers: [
        UpdateBingoParticipantHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(UpdateBingoParticipantHandler);
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

    const command = new UpdateBingoParticipantCommand({
      requester,
      bingoId,
      username: userToUpdate.usernameNormalized,
      updates: {
        teamName: 'les-machos',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException if the participant is not found', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToUpdate = 'non-existent-username';

    const command = new UpdateBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate,
      updates: {
        teamName: 'les-machos',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException if the requester is trying to assign the participant to a team that does not exist', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToUpdate = seedingService.getEntity(User, 'dee420');

    const command = new UpdateBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate.usernameNormalized,
      updates: {
        teamName: 'non-existent-team',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the requester is a participant but not an organizer', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToUpdate = seedingService.getEntity(User, 'didiking');
    const team = seedingService.getEntity(BingoTeam, 'les-machos');

    const command = new UpdateBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate.usernameNormalized,
      updates: {
        teamName: team.nameNormalized,
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if the requester is trying to set the owner role to a participant', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToUpdate = seedingService.getEntity(User, 'dee420');

    const command = new UpdateBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate.usernameNormalized,
      updates: {
        role: BingoRoles.Owner,
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('updates the bingo participant team if requesters is at least organizer', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToUpdate = seedingService.getEntity(User, 'dee420');
    const expectedNewTeam = seedingService.getEntity(BingoTeam, 'les-machos');

    const command = new UpdateBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate.usernameNormalized,
      updates: {
        teamName: expectedNewTeam.nameNormalized,
      },
    });

    const toUpdate = await handler.execute(command);
    expect(toUpdate).toBeDefined();
    expect(toUpdate.bingoId).toBe(bingo.id);
    expect(toUpdate.teamId).toBe(expectedNewTeam.id);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoParticipantUpdatedEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        userId: userToUpdate.id,
        updates: {
          teamName: expectedNewTeam.nameNormalized,
        },
      }),
    );
  });

  it('updates the bingo participant role if requesters is at least owner', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const userToUpdate = seedingService.getEntity(User, 'dee420');
    const expectedBingoRole = BingoRoles.Organizer;

    const command = new UpdateBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate.usernameNormalized,
      updates: {
        role: expectedBingoRole,
      },
    });

    const toUpdate = await handler.execute(command);
    expect(toUpdate).toBeDefined();
    expect(toUpdate.bingoId).toBe(bingo.id);
    expect(toUpdate.role).toBe(expectedBingoRole);
  });

  it('updates the bingo participant role if requesters is moderator but not participant', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const bingo = seedingService.getEntity(Bingo, 'german-osrs');
    const userToUpdate = seedingService.getEntity(User, 'didiking');
    const expectedBingoRole = BingoRoles.Organizer;

    const command = new UpdateBingoParticipantCommand({
      requester,
      bingoId: bingo.bingoId,
      username: userToUpdate.usernameNormalized,
      updates: {
        role: expectedBingoRole,
      },
    });

    const toUpdate = await handler.execute(command);
    expect(toUpdate).toBeDefined();
    expect(toUpdate.bingoId).toBe(bingo.id);
    expect(toUpdate.role).toBe(expectedBingoRole);
  });
});
