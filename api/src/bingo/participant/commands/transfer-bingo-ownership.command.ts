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
import { BingoOwnershipTransferredEvent } from '../events/bingo-ownership-transferred.event';
import { BingoRoles } from '../roles/bingo-roles.constants';

export type TransferBingoOwnershipParams = {
  requester: User;
  bingoId: string;
  targetUsername: string;
};

export type TransferBingoOwnershipResult = void;

export class TransferBingoOwnershipCommand extends Command<TransferBingoOwnershipResult> {
  constructor(public readonly params: TransferBingoOwnershipParams) {
    super();
  }
}

@CommandHandler(TransferBingoOwnershipCommand)
export class TransferBingoOwnershipHandler extends BaseBingoParticipantCommandHandler {
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

  async execute(command: TransferBingoOwnershipCommand): Promise<TransferBingoOwnershipResult> {
    const { requester, bingoId, targetUsername } = command.params;

    const bingo = await this.findBingo(requester, bingoId);
    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.transferOwnership.bingoNotFound'));
    }

    const { requesterParticipant, participantToUpdate } = await this.getRequesterAndParticipantToUpdate(
      bingo.id,
      requester,
      targetUsername,
    );

    if (!requesterParticipant) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.transferOwnership.notOwner'));
    }

    if (!participantToUpdate) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.transferOwnership.targetParticipantNotFound'));
    }

    if (!new BingoParticipantPolicies(requester, requesterParticipant).canTransferOwnership()) {
      throw new ForbiddenException(this.i18nService.t('bingo-participant.transferOwnership.forbidden'));
    }

    await this.dataSource.transaction(async (entityManager) => {
      requesterParticipant.role = BingoRoles.Organizer;
      participantToUpdate.role = BingoRoles.Owner;

      await entityManager.save([requesterParticipant, participantToUpdate]);
    });

    await this.eventBus.publish(
      new BingoOwnershipTransferredEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        userId: participantToUpdate.userId,
      }),
    );
  }
}
