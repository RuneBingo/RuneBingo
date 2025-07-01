import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { I18nService } from 'nestjs-i18n';
import { Between, DataSource, IsNull, Repository } from 'typeorm';

import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { BingoStatus } from '../bingo-status.enum';
import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';
import { BingoStartedEvent } from '../events/bingo-started.event';
import { BingoParticipant } from '../participant/bingo-participant.entity';
import { ViewBingoScope } from '../scopes/view-bingo.scope';
import { BingoTile } from '../tile/bingo-tile.entity';

export type StartBingoParams = {
  requester: User;
  bingoId: string;
  endDate?: string;
};

export type StartBingoResult = Bingo;

export class StartBingoCommand extends Command<StartBingoResult> {
  constructor(public readonly params: StartBingoParams) {
    super();
    this.params = params;
  }
}

@CommandHandler(StartBingoCommand)
export class StartBingoHandler {
  constructor(
    private readonly eventBus: EventBus,
    private readonly i18nService: I18nService<I18nTranslations>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    @InjectRepository(BingoTile)
    private readonly bingoTileRepository: Repository<BingoTile>,
  ) {}

  async execute(command: StartBingoCommand): Promise<StartBingoResult> {
    const { requester, bingoId, endDate } = command.params;

    let scope = this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingoId = :bingoId', { bingoId });
    scope = new ViewBingoScope(requester, scope).resolve();

    const bingo = await scope.getOne();
    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo.startBingo.bingoNotFound'));
    }

    const bingoParticipant = await this.bingoParticipantRepository.findOneBy({
      bingoId: bingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester, bingoParticipant).canStart()) {
      throw new ForbiddenException(this.i18nService.t('bingo.startBingo.forbidden'));
    }

    if (bingo.status !== BingoStatus.Pending) {
      throw new BadRequestException(this.i18nService.t('bingo.startBingo.notPending'));
    }

    this.validateEndDate(bingo, endDate);
    await this.validateAllTilesPresent(bingo);
    await this.validateAllParticipantsAssignedToTeams(bingo);

    await this.dataSource.transaction(async (entityManager) => {
      // TODO: cancel all pending applications
      // TODO: cancel all pending invitations

      bingo.updatedById = requester.id;
      bingo.updatedBy = Promise.resolve(requester);

      bingo.startDate = format(new Date(), 'yyyy-MM-dd');
      bingo.startedAt = new Date();
      bingo.startedById = requester.id;
      bingo.startedBy = Promise.resolve(requester);

      if (endDate) bingo.endDate = endDate;

      await entityManager.save(bingo);
    });

    this.eventBus.publish(
      new BingoStartedEvent({ bingoId: bingo.id, requesterId: requester.id, early: true, endDate }),
    );

    return bingo;
  }

  private validateEndDate(bingo: Bingo, endDate: string | undefined) {
    const newEndDateString = endDate ?? bingo.endDate;
    const newEndDate = new Date(newEndDateString);
    if (newEndDate < new Date()) {
      throw new BadRequestException(this.i18nService.t('bingo.startBingo.endDateBeforeNow'));
    }
  }

  private async validateAllTilesPresent(bingo: Bingo) {
    const expectedTileCount = bingo.width * bingo.height;
    const actualTileCount = await this.bingoTileRepository.countBy({
      bingoId: bingo.id,
      x: Between(1, bingo.width),
      y: Between(1, bingo.height),
    });

    if (actualTileCount !== expectedTileCount) {
      throw new BadRequestException(this.i18nService.t('bingo.startBingo.tilesNotPresent'));
    }
  }

  private async validateAllParticipantsAssignedToTeams(bingo: Bingo) {
    const orphanedParticipants = await this.bingoParticipantRepository.existsBy({
      bingoId: bingo.id,
      teamId: IsNull(),
    });

    if (orphanedParticipants) {
      throw new BadRequestException(this.i18nService.t('bingo.startBingo.participantsNotAssignedToTeams'));
    }
  }
}
