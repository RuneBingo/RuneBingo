import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { addDays, formatDate, subDays } from 'date-fns';
import { DataSource } from 'typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { User } from '@/user/user.entity';

import { ResetBingoCommand, ResetBingoHandler } from './reset-bingo.command';
import { BingoStatus } from '../bingo-status.enum';
import { Bingo } from '../bingo.entity';
import { BingoResetEvent } from '../events/bingo-reset.event';
import { BingoParticipant } from '../participant/bingo-participant.entity';
import { BingoTeam } from '../team/bingo-team.entity';
import { BingoTileItem } from '../tile/bingo-tile-item';
import { BingoTile } from '../tile/bingo-tile.entity';

describe('ResetBingoHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: ResetBingoHandler;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        configModule,
        dbModule,
        i18nModule,
        TypeOrmModule.forFeature([Bingo, BingoTile, BingoTileItem, BingoTeam, BingoParticipant, User]),
      ],
      providers: [
        ResetBingoHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(ResetBingoHandler);
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

  it('throws NotFoundException if the requester is not allowed to see the bingo', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const bingo = seedingService.getEntity(Bingo, 'lifecycle-bingo');

    const command = new ResetBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      startDate: formatDate(addDays(new Date(), 2), 'yyyy-MM-dd'),
      endDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
      maxRegistrationDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the requester is not allowed to reset the bingo', async () => {
    const requester = seedingService.getEntity(User, 'didiking');
    const bingo = seedingService.getEntity(Bingo, 'lifecycle-bingo');

    const command = new ResetBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      startDate: formatDate(addDays(new Date(), 2), 'yyyy-MM-dd'),
      endDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
      maxRegistrationDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException if the bingo is not canceled', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'ready_bingo');

    const command = new ResetBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      startDate: formatDate(addDays(new Date(), 2), 'yyyy-MM-dd'),
      endDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
      maxRegistrationDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException if the start date is before today', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'lifecycle-bingo');

    const command = new ResetBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      startDate: formatDate(subDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
      maxRegistrationDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException if the start date is before the max registration date', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'lifecycle-bingo');

    const command = new ResetBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      startDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
      maxRegistrationDate: formatDate(addDays(new Date(), 2), 'yyyy-MM-dd'),
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException if the end date is before the start date', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'lifecycle-bingo');

    const command = new ResetBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      startDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
      endDate: formatDate(addDays(new Date(), 2), 'yyyy-MM-dd'),
      maxRegistrationDate: formatDate(subDays(new Date(), 2), 'yyyy-MM-dd'),
    });

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('resets the bingo and its lifecycle and emits a BingoResetEvent', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'lifecycle-bingo');

    const tilesCount = await dataSource.manager.count(BingoTile, { where: { bingoId: bingo.id } });
    const teamsCount = await dataSource.manager.count(BingoTeam, { where: { bingoId: bingo.id } });
    const participantsCount = await dataSource.manager.count(BingoParticipant, { where: { bingoId: bingo.id } });

    const command = new ResetBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      startDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
      maxRegistrationDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
    });

    const result = await handler.execute(command);

    const newTilesCount = await dataSource.manager.count(BingoTile, { where: { bingoId: bingo.id } });
    const newTeamsCount = await dataSource.manager.count(BingoTeam, { where: { bingoId: bingo.id } });
    const newParticipantsCount = await dataSource.manager.count(BingoParticipant, { where: { bingoId: bingo.id } });

    expect(result.status).toBe(BingoStatus.Pending);
    expect(result.startDate).toBe(formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'));
    expect(result.endDate).toBe(formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'));
    expect(result.maxRegistrationDate).toBe(formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'));
    expect(result.canceledAt).toBeNull();
    expect(result.startedAt).toBeNull();
    expect(result.endedAt).toBeNull();
    expect(result.canceledById).toBeNull();
    expect(result.startedById).toBeNull();
    expect(result.endedById).toBeNull();
    expect(result.resetById).toEqual(requester.id);
    expect(result.resetAt).toBeInstanceOf(Date);

    await expect(result.startedBy).resolves.toBeNull();
    await expect(result.endedBy).resolves.toBeNull();
    await expect(result.canceledBy).resolves.toBeNull();
    await expect(result.resetBy).resolves.toEqual(requester);

    expect(newTilesCount).toBe(tilesCount);
    expect(newTeamsCount).toBe(teamsCount);
    expect(newParticipantsCount).toBe(participantsCount);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    void expect(eventBus.publish).toHaveBeenCalledWith(
      new BingoResetEvent({
        bingoId: bingo.id,
        requesterId: requester.id,
        deletedTiles: false,
        deletedTeams: false,
        deletedParticipants: false,
        startDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
        endDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
        maxRegistrationDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
      }),
    );
  });

  it('deletes all the tiles if deleteTiles is true', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'lifecycle-bingo');

    const command = new ResetBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      startDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
      maxRegistrationDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
      deleteTiles: true,
    });

    await handler.execute(command);

    const newTilesCount = await dataSource.manager.count(BingoTile, { where: { bingoId: bingo.id } });
    expect(newTilesCount).toBe(0);
  });

  it('resets the teams points if deleteTeams is false', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'lifecycle-bingo');

    const command = new ResetBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      startDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
      maxRegistrationDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
    });

    await handler.execute(command);

    const teams = await dataSource.manager.find(BingoTeam, { where: { bingoId: bingo.id } });
    const teamsPoints = teams.reduce((acc, team) => acc + team.points, 0);
    expect(teamsPoints).toBe(0);
  });

  it('deletes all the participants if deleteParticipants is true', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'lifecycle-bingo');

    const command = new ResetBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      startDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
      maxRegistrationDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
      deleteParticipants: true,
    });

    await handler.execute(command);

    const newParticipantsCount = await dataSource.manager.count(BingoParticipant, { where: { bingoId: bingo.id } });
    expect(newParticipantsCount).toBe(0);
  });

  it('removes the team captains if deleteParticipants is true but deleteTeams is false', async () => {
    const requester = seedingService.getEntity(User, 'raph');
    const bingo = seedingService.getEntity(Bingo, 'lifecycle-bingo');

    const command = new ResetBingoCommand({
      requester,
      bingoId: bingo.bingoId,
      startDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: formatDate(addDays(new Date(), 3), 'yyyy-MM-dd'),
      maxRegistrationDate: formatDate(addDays(new Date(), 1), 'yyyy-MM-dd'),
      deleteParticipants: true,
    });

    await handler.execute(command);

    const teams = await dataSource.manager.find(BingoTeam, { where: { bingoId: bingo.id } });
    teams.forEach((team) => {
      expect(team.captainId).toBeNull();
    });
  });
});
