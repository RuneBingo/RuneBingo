import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
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
import { BingoParticipantUpdatedEvent } from '../events/bingo-participant-updated.event';
import { BingoRoles } from '../roles/bingo-roles.constants';

export type UpdateBingoParticipantParams = {
  requester: User;
  bingoId: string;
  username: string;
  updates: {
    role?: BingoRoles;
    teamName?: string;
  };
};

export type UpdateBingoParticipantResult = BingoParticipant;

export class UpdateBingoParticipantCommand extends Command<BingoParticipant> {
  constructor(public readonly params: UpdateBingoParticipantParams) {
    super();
  }
}

@CommandHandler(UpdateBingoParticipantCommand)
export class UpdateBingoParticipantHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    @InjectRepository(BingoTeam)
    private readonly bingoTeamRepository: Repository<BingoTeam>,
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateBingoParticipantCommand): Promise<UpdateBingoParticipantResult> {
    const { requester, bingoId, username: usernameToUpdate, updates } = command.params;

    const bingo = await this.bingoRepository.findOneBy({ bingoId });

    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.removeBingoParticipant.bingoNotFound'));
    }

    const participants = await this.bingoParticipantRepository
      .createQueryBuilder('bingo_participant')
      .innerJoin('bingo_participant.user', 'user')
      .where('(bingo_participant.bingo_id = :bingoId AND user.username_normalized IN (:...usernames))', {
        bingoId: bingo.id,
        usernames: [requester.usernameNormalized, usernameToUpdate],
      })
      .getMany();

    let requesterParticipant: BingoParticipant | undefined;
    let participantToUpdate: BingoParticipant | undefined;

    for (const participant of participants) {
      const user = await participant.user;
      if (user.usernameNormalized === usernameToUpdate) {
        participantToUpdate = participant;
      }
      if (user.usernameNormalized === requester.usernameNormalized) {
        requesterParticipant = participant;
      }
    }

    if (!participantToUpdate) {
      throw new NotFoundException(
        this.i18nService.t('bingo-participant.updateBingoParticipant.bingoParticipantNotFound'),
      );
    }

    let team: BingoTeam | null = null;
    if (updates.teamName) {
      team = await this.bingoTeamRepository.findOneBy({ nameNormalized: updates.teamName, bingoId: bingo.id });
    }

    if (updates.teamName && !team) {
      throw new BadRequestException(this.i18nService.t('bingo-participant.updateBingoParticipant.teamNotFound'));
    }

    if (!new BingoParticipantPolicies(requester).canUpdate(requesterParticipant, participantToUpdate, updates.role)) {
      throw new ForbiddenException(
        this.i18nService.t('bingo-participant.updateBingoParticipant.notAuthorizedToUpdate'),
      );
    }

    if (updates.teamName && team) {
      participantToUpdate.teamId = team.id;
    }

    if (updates.role) {
      participantToUpdate.role = updates.role;
    }

    this.eventBus.publish(
      new BingoParticipantUpdatedEvent({
        bingoId: bingo.id,
        requesterId: requester.id,
        userId: participantToUpdate.userId,
        updates: {
          role: updates.role,
          teamName: updates.teamName,
        },
      }),
    );
    return await this.bingoParticipantRepository.save(participantToUpdate);
  }

  getRoleFromString(role: string): BingoRoles | undefined {
    if (Object.values(BingoRoles).includes(role as BingoRoles)) {
      return role as BingoRoles;
    }
    return undefined;
  }
}
