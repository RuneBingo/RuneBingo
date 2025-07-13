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
import { TransferBingoOwnershipCommand, TransferBingoOwnershipHandler } from './transfer-bingo-ownership.command';
import { BingoOwnershipTransferredEvent } from '../events/bingo-ownership-transferred.event';
import { BingoRoles } from '../roles/bingo-roles.constants';

describe('TransferBingoOwnershipHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: TransferBingoOwnershipHandler;
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
        TransferBingoOwnershipHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(TransferBingoOwnershipHandler);
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
    const requester = seedingService.getEntity(User, 'char0o');
    const bingoId = v4();
    const targetUser = seedingService.getEntity(User, 'dee420');

    const command = new TransferBingoOwnershipCommand({
      requester,
      bingoId,
      targetUsername: targetUser.usernameNormalized,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException if the requester is not a participant in the bingo', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const targetUser = seedingService.getEntity(User, 'dee420');

    const command = new TransferBingoOwnershipCommand({
      requester,
      bingoId: bingo.bingoId,
      targetUsername: targetUser.usernameNormalized,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException if the target participant is not found', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const targetUsername = 'non-existent-username';

    const command = new TransferBingoOwnershipCommand({
      requester,
      bingoId: bingo.bingoId,
      targetUsername,
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the requester is not the owner', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const targetUser = seedingService.getEntity(User, 'dee420');

    const command = new TransferBingoOwnershipCommand({
      requester,
      bingoId: bingo.bingoId,
      targetUsername: targetUser.usernameNormalized,
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('successfully transfers ownership and emits a BingoOwnershipTransferredEvent', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const targetUser = seedingService.getEntity(User, 'dee420');

    const command = new TransferBingoOwnershipCommand({
      requester,
      bingoId: bingo.bingoId,
      targetUsername: targetUser.usernameNormalized,
    });

    await handler.execute(command);

    const requesterParticipant = await dataSource.getRepository(BingoParticipant).findOne({
      where: {
        bingoId: bingo.id,
        userId: requester.id,
      },
    });
    expect(requesterParticipant?.role).toBe(BingoRoles.Organizer);

    const targetParticipant = await dataSource.getRepository(BingoParticipant).findOne({
      where: {
        bingoId: bingo.id,
        userId: targetUser.id,
      },
    });
    expect(targetParticipant?.role).toBe(BingoRoles.Owner);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoOwnershipTransferredEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        userId: targetUser.id,
      }),
    );
  });

  it('allows owner to transfer ownership to an organizer', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const targetUser = seedingService.getEntity(User, 'didiking');

    const command = new TransferBingoOwnershipCommand({
      requester,
      bingoId: bingo.bingoId,
      targetUsername: targetUser.usernameNormalized,
    });

    await handler.execute(command);

    const requesterParticipant = await dataSource.getRepository(BingoParticipant).findOne({
      where: {
        bingoId: bingo.id,
        userId: requester.id,
      },
    });
    expect(requesterParticipant?.role).toBe(BingoRoles.Organizer);

    const targetParticipant = await dataSource.getRepository(BingoParticipant).findOne({
      where: {
        bingoId: bingo.id,
        userId: targetUser.id,
      },
    });
    expect(targetParticipant?.role).toBe(BingoRoles.Owner);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoOwnershipTransferredEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        userId: targetUser.id,
      }),
    );
  });

  it('allows owner to transfer ownership to a regular participant', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const bingo = seedingService.getEntity(Bingo, 'osrs-qc');
    const targetUser = seedingService.getEntity(User, 'dee420');

    const command = new TransferBingoOwnershipCommand({
      requester,
      bingoId: bingo.bingoId,
      targetUsername: targetUser.usernameNormalized,
    });

    await handler.execute(command);

    const requesterParticipant = await dataSource.getRepository(BingoParticipant).findOne({
      where: {
        bingoId: bingo.id,
        userId: requester.id,
      },
    });
    expect(requesterParticipant?.role).toBe(BingoRoles.Organizer);

    const targetParticipant = await dataSource.getRepository(BingoParticipant).findOne({
      where: {
        bingoId: bingo.id,
        userId: targetUser.id,
      },
    });
    expect(targetParticipant?.role).toBe(BingoRoles.Owner);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoOwnershipTransferredEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        userId: targetUser.id,
      }),
    );
  });
});
