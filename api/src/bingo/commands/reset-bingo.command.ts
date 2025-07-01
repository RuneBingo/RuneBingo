import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { format, isBefore } from 'date-fns';
import { I18nService } from 'nestjs-i18n';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { BingoStatus } from '../bingo-status.enum';
import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';
import { BingoResetEvent } from '../events/bingo-reset.event';
import { BingoParticipant } from '../participant/bingo-participant.entity';
import { ViewBingoScope } from '../scopes/view-bingo.scope';
import { BingoTeam } from '../team/bingo-team.entity';
import { BingoTileItem } from '../tile/bingo-tile-item';
import { BingoTile } from '../tile/bingo-tile.entity';

export type ResetBingoParams = {
  requester: User;
  bingoId: string;
  startDate: string;
  endDate: string;
  maxRegistrationDate: string;
  deleteTiles?: boolean;
  deleteTeams?: boolean;
  deleteParticipants?: boolean;
};

export type ResetBingoResult = Bingo;

export class ResetBingoCommand extends Command<ResetBingoResult> {
  constructor(public readonly params: ResetBingoParams) {
    super();
    this.params = params;
  }
}

@CommandHandler(ResetBingoCommand)
export class ResetBingoHandler {
  constructor(
    private readonly eventBus: EventBus,
    private readonly i18n: I18nService<I18nTranslations>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
  ) {}

  async execute(command: ResetBingoCommand): Promise<ResetBingoResult> {
    const {
      requester,
      bingoId,
      startDate,
      endDate,
      maxRegistrationDate,
      deleteTiles = false,
      deleteTeams = false,
      deleteParticipants = false,
    } = command.params;

    const bingo = await this.fetchBingo(requester, bingoId);
    await this.authorize(requester, bingo);

    if (bingo.status !== BingoStatus.Canceled) {
      throw new BadRequestException(this.i18n.t('bingo.resetBingo.notCanceled'));
    }

    this.validateDates(startDate, endDate, maxRegistrationDate);

    await this.dataSource.transaction(async (manager) => {
      // TODO: delete tile completion requests
      if (deleteTiles) await this.deleteTiles(manager, bingo);

      if (deleteTeams) {
        await manager.softRemove(BingoTeam, { bingoId: bingo.id });
      } else {
        await manager.update(BingoTeam, { bingoId: bingo.id }, { points: 0 });
      }

      if (deleteParticipants) await this.deleteParticipants(manager, bingo, deleteTeams);

      this.resetBingoLifecycle(requester, bingo, startDate, endDate, maxRegistrationDate);

      await manager.save(bingo);
    });

    await this.eventBus.publish(
      new BingoResetEvent({
        bingoId: bingo.id,
        requesterId: requester.id,
        startDate,
        endDate,
        maxRegistrationDate,
        deletedTiles: deleteTiles,
        deletedTeams: deleteTeams,
        deletedParticipants: deleteParticipants,
      }),
    );

    return bingo;
  }

  private async fetchBingo(requester: User, bingoId: string) {
    const scope = new ViewBingoScope(
      requester,
      this.dataSource.createQueryBuilder(Bingo, 'bingo').where('bingo.bingo_id = :id', { id: bingoId }),
    ).resolve();

    const bingo = await scope.getOne();
    if (!bingo) {
      throw new NotFoundException(this.i18n.t('bingo.resetBingo.bingoNotFound'));
    }

    return bingo;
  }

  private async authorize(requester: User, bingo: Bingo) {
    const bingoParticipant = await this.bingoParticipantRepository.findOneBy({
      bingoId: bingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester, bingoParticipant).canReset()) {
      throw new ForbiddenException(this.i18n.t('bingo.resetBingo.forbidden'));
    }
  }

  private validateDates(startDate: string, endDate: string, maxRegistrationDate: string) {
    const today = format(new Date(), 'yyyy-MM-dd');

    if (isBefore(startDate, today)) {
      throw new BadRequestException(this.i18n.t('bingo.resetBingo.startDateBeforeToday'));
    }

    if (isBefore(startDate, maxRegistrationDate)) {
      throw new BadRequestException(this.i18n.t('bingo.resetBingo.startDateBeforeMaxRegistrationDate'));
    }

    if (endDate === startDate || isBefore(endDate, startDate)) {
      throw new BadRequestException(this.i18n.t('bingo.resetBingo.endDateBeforeStartDate'));
    }
  }

  private async deleteTiles(manager: EntityManager, bingo: Bingo) {
    const tiles = await manager.findBy(BingoTile, { bingoId: bingo.id });
    if (!tiles?.length) return;

    await manager.delete(BingoTileItem, { bingoTileId: In(tiles.map((tile) => tile.id)) });
    await manager.delete(BingoTile, { bingoId: bingo.id });
  }

  private async deleteParticipants(manager: EntityManager, bingo: Bingo, deleteTeams: boolean) {
    // We must unassign all team captains if participants are deleted but not teams
    if (!deleteTeams) await manager.update(BingoTeam, { bingoId: bingo.id }, { captainId: null });

    await manager.delete(BingoParticipant, { bingoId: bingo.id });
  }

  private resetBingoLifecycle(
    requester: User,
    bingo: Bingo,
    startDate: string,
    endDate: string,
    maxRegistrationDate: string,
  ) {
    bingo.startedAt = null;
    bingo.startedById = null;
    bingo.startedBy = Promise.resolve(null);

    bingo.endedAt = null;
    bingo.endedById = null;
    bingo.endedBy = Promise.resolve(null);

    bingo.canceledAt = null;
    bingo.canceledById = null;
    bingo.canceledBy = Promise.resolve(null);

    bingo.resetAt = new Date();
    bingo.resetById = requester.id;
    bingo.resetBy = Promise.resolve(requester);

    bingo.startDate = startDate;
    bingo.endDate = endDate;
    bingo.maxRegistrationDate = maxRegistrationDate;
  }
}
