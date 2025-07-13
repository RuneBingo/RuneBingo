import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { DataSource, Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { BingoParticipant } from '../bingo-participant.entity';
import { BaseBingoParticipantCommandHandler } from './base-bingo-participant.command';
import { BingoParticipantPolicies } from '../bingo-participant.policies';
import { BingoParticipantKickedEvent } from '../events/bingo-participant-kicked.event';

export type KickBingoParticipantParams = {
  requester: User;
  bingoId: string;
  username: string;
  deleteTileCompletions?: boolean;
};

export type KickBingoParticipantResult = void;

export class KickBingoParticipantCommand extends Command<KickBingoParticipantResult> {
  constructor(public readonly params: KickBingoParticipantParams) {
    super();
  }
}

@CommandHandler(KickBingoParticipantCommand)
export class KickBingoParticipantHandler extends BaseBingoParticipantCommandHandler {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    @InjectRepository(Bingo)
    protected readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    protected readonly bingoParticipantRepository: Repository<BingoParticipant>,
    @InjectRepository(BingoTeam)
    protected readonly bingoTeamRepository: Repository<BingoTeam>,
    protected readonly i18nService: I18nService<I18nTranslations>,
    private readonly eventBus: EventBus,
  ) {
    super(bingoRepository, bingoParticipantRepository, bingoTeamRepository, i18nService);
  }

  async execute(command: KickBingoParticipantCommand): Promise<KickBingoParticipantResult> {
    const { requester, bingoId, username, deleteTileCompletions } = command.params;

    const bingo = await this.findBingo(requester, bingoId);
    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.kickBingoParticipant.bingoNotFound'));
    }

    const { requesterParticipant, participantToUpdate } = await this.getRequesterAndParticipantToUpdate(
      bingo.id,
      requester,
      username,
    );

    if (!participantToUpdate) {
      throw new NotFoundException(
        this.i18nService.t('bingo-participant.kickBingoParticipant.bingoParticipantNotFound'),
      );
    }

    if (!new BingoParticipantPolicies(requester, requesterParticipant).canKick(participantToUpdate)) {
      throw new ForbiddenException(this.i18nService.t('bingo-participant.kickBingoParticipant.forbidden'));
    }

    const userId = participantToUpdate.userId;

    await this.dataSource.transaction(async (entityManager) => {
      // TODO: delete tile completion requests
      // TODO: delete tile completions
      await this.removeTeamCaptain(entityManager, bingo.id, participantToUpdate);

      await entityManager.remove(participantToUpdate);
    });

    await this.eventBus.publish(
      new BingoParticipantKickedEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        userId,
        deletedTileCompletions: Boolean(deleteTileCompletions),
      }),
    );
  }
}
