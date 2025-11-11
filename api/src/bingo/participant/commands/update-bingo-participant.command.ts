import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { BingoParticipant } from '../bingo-participant.entity';
import { BingoParticipantPolicies } from '../bingo-participant.policies';
import { BaseBingoParticipantCommandHandler } from './base-bingo-participant.command';
import { BingoParticipantUpdatedEvent } from '../events/bingo-participant-updated.event';
import { BingoRoles } from '../roles/bingo-roles.constants';

export type UpdateBingoParticipantParams = {
  requester: User;
  bingoId: string;
  username: string;
  updates: {
    role?: BingoRoles;
    teamName?: string | null;
  };
};

export type UpdateBingoParticipantResult = BingoParticipant;

export class UpdateBingoParticipantCommand extends Command<BingoParticipant> {
  constructor(public readonly params: UpdateBingoParticipantParams) {
    super();
  }
}

@CommandHandler(UpdateBingoParticipantCommand)
export class UpdateBingoParticipantHandler extends BaseBingoParticipantCommandHandler {
  constructor(
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

  async execute(command: UpdateBingoParticipantCommand): Promise<UpdateBingoParticipantResult> {
    const { requester, bingoId, username, updates } = command.params;

    const bingo = await this.findBingo(requester, bingoId);
    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.updateBingoParticipant.bingoNotFound'));
    }

    const { requesterParticipant, participantToUpdate } = await this.getRequesterAndParticipantToUpdate(
      bingo.id,
      requester,
      username,
    );

    if (!participantToUpdate) {
      throw new NotFoundException(
        this.i18nService.t('bingo-participant.updateBingoParticipant.bingoParticipantNotFound'),
      );
    }

    const filteredUpdates = { ...updates };
    if (updates.role === participantToUpdate.role) delete filteredUpdates.role;

    let team: BingoTeam | null = null;
    if (updates.teamName) {
      team = await this.bingoTeamRepository.findOneBy({
        nameNormalized: BingoTeam.normalizeName(updates.teamName),
        bingoId: bingo.id,
      });
      if (!team) {
        throw new NotFoundException(this.i18nService.t('bingo-participant.updateBingoParticipant.teamNotFound'));
      }

      if (team.id === participantToUpdate.teamId) delete filteredUpdates.teamName;
    }

    if (Object.keys(filteredUpdates).length === 0) return participantToUpdate;

    if (
      !new BingoParticipantPolicies(requester, requesterParticipant).canUpdate(participantToUpdate, filteredUpdates)
    ) {
      throw new ForbiddenException(this.i18nService.t('bingo-participant.updateBingoParticipant.forbidden'));
    }

    if (filteredUpdates.teamName !== undefined) participantToUpdate.teamId = team?.id ?? null;

    if (filteredUpdates.role) {
      if (filteredUpdates.role === BingoRoles.Owner) {
        throw new ForbiddenException(this.i18nService.t('bingo-participant.updateBingoParticipant.cannotSetOwnerRole'));
      }

      participantToUpdate.role = filteredUpdates.role;
    }

    await this.bingoParticipantRepository.save(participantToUpdate);

    // TODO: recalculate bingo points if a new team is assigned

    await this.eventBus.publish(
      new BingoParticipantUpdatedEvent({
        bingoId: bingo.id,
        requesterId: requester.id,
        userId: participantToUpdate.userId,
        updates: filteredUpdates,
      }),
    );

    return participantToUpdate;
  }
}
