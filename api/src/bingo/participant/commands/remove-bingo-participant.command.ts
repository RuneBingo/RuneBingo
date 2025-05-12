import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { BingoParticipant } from '../bingo-participant.entity';
import { BingoParticipantPolicies } from '../bingo-participant.policies';
import { BingoParticipantRemovedEvent } from '../events/bingo-participant-removed.event';

export type RemoveBingoParticipantParams = {
  requester: User;
  bingoId: string;
  username: string;
};

export type RemoveBingoParticipantResult = BingoParticipant;

export class RemoveBingoParticipantCommand extends Command<BingoParticipant> {
  constructor(public readonly params: RemoveBingoParticipantParams) {
    super();
  }
}

@CommandHandler(RemoveBingoParticipantCommand)
export class RemoveBingoParticipantHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RemoveBingoParticipantCommand): Promise<void> {
    const { requester, bingoId, username } = command.params;

    const bingo = await this.bingoRepository.findOne({
      where: { bingoId },
      relations: ['participants', 'participants.user'],
    });

    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.removeBingoParticipant.bingoNotFound'));
    }

    const participants = await bingo.participants;

    const requesterParticipant = participants.find((participant) => participant.userId === requester.id);

    if (!requesterParticipant) {
      throw new ForbiddenException(
        this.i18nService.t('bingo-participant.removeBingoParticipant.notParticipantOfTheBingo'),
      );
    }

    let participantToRemove: BingoParticipant | undefined;
    for (const participant of participants) {
      const user = await participant.user;
      if (user.usernameNormalized !== username) continue;
      participantToRemove = participant;
      break;
    }

    if (!participantToRemove) {
      throw new NotFoundException(
        this.i18nService.t('bingo-participant.removeBingoParticipant.bingoParticipantNotFound'),
      );
    }

    if (!new BingoParticipantPolicies(requester).canRemove(requesterParticipant, participantToRemove)) {
      throw new ForbiddenException(
        this.i18nService.t('bingo-participant.removeBingoParticipant.notAuthorizedToDelete'),
      );
    }

    this.eventBus.publish(
      new BingoParticipantRemovedEvent({
        bingoId: bingo.id,
        requesterId: requester.id,
        userId: participantToRemove.userId,
        role: participantToRemove.role,
      }),
    );

    await this.bingoParticipantRepository.remove(participantToRemove);
  }
}
