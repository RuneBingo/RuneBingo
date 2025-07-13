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
import { BingoParticipantLeftEvent } from '../events/bingo-participant-left.event';
import { BingoRoles } from '../roles/bingo-roles.constants';

export type LeaveBingoParams = {
  requester: User;
  bingoId: string;
};

export type LeaveBingoResult = void;

export class LeaveBingoCommand extends Command<LeaveBingoResult> {
  constructor(public readonly params: LeaveBingoParams) {
    super();
  }
}

@CommandHandler(LeaveBingoCommand)
export class LeaveBingoHandler extends BaseBingoParticipantCommandHandler {
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

  async execute(command: LeaveBingoCommand): Promise<LeaveBingoResult> {
    const { requester, bingoId } = command.params;

    const bingo = await this.findBingo(requester, bingoId);
    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.leaveBingo.bingoNotFound'));
    }

    const requesterParticipant = await this.bingoParticipantRepository.findOne({
      where: {
        bingoId: bingo.id,
        user: { id: requester.id },
      },
      relations: ['user'],
    });

    if (!requesterParticipant) {
      throw new ForbiddenException(this.i18nService.t('bingo-participant.leaveBingo.notParticipant'));
    }

    if (requesterParticipant.role === BingoRoles.Owner) {
      throw new ForbiddenException(this.i18nService.t('bingo-participant.leaveBingo.ownerCannotLeave'));
    }

    if (!new BingoParticipantPolicies(requester, requesterParticipant).canLeave()) {
      throw new ForbiddenException(this.i18nService.t('bingo-participant.leaveBingo.forbidden'));
    }

    await this.dataSource.transaction(async (entityManager) => {
      await this.removeTeamCaptain(entityManager, bingo.id, requesterParticipant);

      // TODO: delete tile completion requests

      await entityManager.remove(requesterParticipant);
    });

    await this.eventBus.publish(
      new BingoParticipantLeftEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
      }),
    );
  }
}
