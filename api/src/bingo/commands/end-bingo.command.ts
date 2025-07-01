import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { I18nService } from 'nestjs-i18n';
import { DataSource, Repository } from 'typeorm';

import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { BingoStatus } from '../bingo-status.enum';
import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';
import { BingoEndedEvent } from '../events/bingo-ended.event';
import { BingoParticipant } from '../participant/bingo-participant.entity';
import { ViewBingoScope } from '../scopes/view-bingo.scope';

export type EndBingoParams = {
  requester: User;
  bingoId: string;
};

export type EndBingoResult = Bingo;

export class EndBingoCommand extends Command<EndBingoResult> {
  constructor(public readonly params: EndBingoParams) {
    super();
    this.params = params;
  }
}

@CommandHandler(EndBingoCommand)
export class EndBingoHandler {
  constructor(
    private readonly eventBus: EventBus,
    private readonly i18nService: I18nService<I18nTranslations>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
  ) {}

  async execute(command: EndBingoCommand): Promise<EndBingoResult> {
    const { requester, bingoId } = command.params;

    let scope = this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingoId = :bingoId', { bingoId });
    scope = new ViewBingoScope(requester, scope).resolve();

    const bingo = await scope.getOne();
    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo.endBingo.bingoNotFound'));
    }

    const bingoParticipant = await this.bingoParticipantRepository.findOneBy({
      bingoId: bingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester, bingoParticipant).canEnd()) {
      throw new ForbiddenException(this.i18nService.t('bingo.endBingo.forbidden'));
    }

    if (bingo.status !== BingoStatus.Ongoing) {
      throw new BadRequestException(this.i18nService.t('bingo.endBingo.notOngoing'));
    }

    await this.dataSource.transaction(async (entityManager) => {
      // TODO: cancel all pending tile completion requests
      // TODO: recompute all scores

      bingo.updatedById = requester.id;
      bingo.updatedBy = Promise.resolve(requester);

      bingo.endDate = format(new Date(), 'yyyy-MM-dd');
      bingo.endedAt = new Date();
      bingo.endedById = requester.id;
      bingo.endedBy = Promise.resolve(requester);

      await entityManager.save(bingo);
    });

    this.eventBus.publish(new BingoEndedEvent({ bingoId: bingo.id, requesterId: requester.id, early: true }));

    return bingo;
  }
}
