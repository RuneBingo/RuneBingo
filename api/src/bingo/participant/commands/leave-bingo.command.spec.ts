import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { BingoParticipant } from '../bingo-participant.entity';
import { LeaveBingoCommand, LeaveBingoHandler } from './leave-bingo.command';
import { BingoParticipantLeftEvent } from '../events/bingo-participant-left.event';
import { BingoRoles } from '../roles/bingo-roles.constants';

describe('LeaveBingoHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: LeaveBingoHandler;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        configModule,
        dbModule,
        i18nModule,
        TypeOrmModule.forFeature([Bingo, User, BingoParticipant, BingoTeam]),
      ],
      providers: [
        LeaveBingoHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(LeaveBingoHandler);
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

  it('throws NotFoundException if the bingo is not found', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingoId = v4(); // I swear, if this test fails, I should buy a lottery ticket

    const command = new LeaveBingoCommand({
      requester,
      bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the requester is not a participant in the bingo', async () => {
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const nonExistentUser = seedingService.getEntity(User, 'zezima');

    const command = new LeaveBingoCommand({
      requester: nonExistentUser,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if the requester is the owner of the bingo', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new LeaveBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if the requester is not a participant', async () => {
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const nonExistentUser = seedingService.getEntity(User, 'zezima');

    const command = new LeaveBingoCommand({
      requester: nonExistentUser,
      bingoId: bingo.bingoId,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('successfully leaves the bingo and emits a BingoParticipantLeftEvent', async () => {
    const requester = seedingService.getEntity(User, 'dee420');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new LeaveBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await handler.execute(command);

    const bingoParticipant = await dataSource.getRepository(BingoParticipant).findOne({
      where: {
        bingoId: bingo.id,
        userId: requester.id,
      },
    });
    expect(bingoParticipant).toBeNull();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoParticipantLeftEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
      }),
    );
  });

  it('removes the participant as a team captain in teams where they are a captain of', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const team = seedingService.getEntity(BingoTeam, 'les-machos');

    const command = new LeaveBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await handler.execute(command);

    const updatedTeam = await dataSource.getRepository(BingoTeam).findOne({
      where: { id: team.id },
    });
    expect(updatedTeam?.captainId).toBeNull();
  });

  it('allows an organizer to leave the bingo', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const participant = await dataSource.getRepository(BingoParticipant).findOne({
      where: {
        bingoId: bingo.id,
        userId: requester.id,
      },
    });
    if (participant) {
      participant.role = BingoRoles.Organizer;
      await dataSource.getRepository(BingoParticipant).save(participant);
    }

    const command = new LeaveBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await handler.execute(command);

    const bingoParticipant = await dataSource.getRepository(BingoParticipant).findOne({
      where: {
        bingoId: bingo.id,
        userId: requester.id,
      },
    });
    expect(bingoParticipant).toBeNull();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoParticipantLeftEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
      }),
    );
  });

  it('allows a regular participant to leave the bingo', async () => {
    const requester = seedingService.getEntity(User, 'dee420'); // Regular participant
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');

    const command = new LeaveBingoCommand({
      requester,
      bingoId: bingo.bingoId,
    });

    await handler.execute(command);

    const bingoParticipant = await dataSource.getRepository(BingoParticipant).findOne({
      where: {
        bingoId: bingo.id,
        userId: requester.id,
      },
    });
    expect(bingoParticipant).toBeNull();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoParticipantLeftEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
      }),
    );
  });
});
