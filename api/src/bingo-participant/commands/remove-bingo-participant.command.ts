import { Bingo } from '@/bingo/bingo.entity';
import { User } from '@/user/user.entity';
import { BingoRoles } from '../roles/bingo-roles.constants';
import { BingoParticipant } from '../bingo-participant.entity';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { I18nTranslations } from '@/i18n/types';
import { I18nService } from 'nestjs-i18n';
import { BingoParticipantPolicies } from '../bingo-participant.policies';
import { BingoParticipantRemovedEvent } from '../events/bingo-participant-removed.event';

export type RemoveBingoParticipantParams = {
  requester: User;
  bingoId: string;
  username: string;
  bingo?: Bingo;
  bingoParticipant?: BingoParticipant;
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RemoveBingoParticipantCommand): Promise<void> {
    const { requester, bingoId, username, bingo, bingoParticipant } = command.params;

    const foundBingo = bingo || (await this.bingoRepository.findOneBy({ bingoId }));

    if (!foundBingo) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.removeBingoParticipant.bingoNotFound'));
    }

    const userToRemove = await this.userRepository.findOneBy({ usernameNormalized: username });

    if (!userToRemove) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.removeBingoParticipant.userNotFound'));
    }

    const bingoParticipantToRemove = await this.bingoParticipantRepository.findOneBy({
      userId: userToRemove.id,
      bingoId: foundBingo.id,
    });

    if (!bingoParticipantToRemove) {
      throw new NotFoundException(
        this.i18nService.t('bingo-participant.removeBingoParticipant.bingoParticipantNotFound'),
      );
    }

    const requesterParticipant =
      bingoParticipant ||
      (await this.bingoParticipantRepository.findOneBy({
        bingoId: foundBingo.id,
        userId: requester.id,
      }));

    if (!requesterParticipant) {
      throw new ForbiddenException(
        this.i18nService.t('bingo-participant.removeBingoParticipant.notParticipantOfTheBingo'),
      );
    }

    if (!new BingoParticipantPolicies(requester).canRemove(requesterParticipant, bingoParticipantToRemove)) {
      throw new ForbiddenException(
        this.i18nService.t('bingo-participant.removeBingoParticipant.notAuthorizedToDelete'),
      );
    }

    this.eventBus.publish(
      new BingoParticipantRemovedEvent({
        bingoId: foundBingo.id,
        requesterId: requester.id,
        userId: userToRemove.id,
        role: bingoParticipantToRemove.role,
      }),
    );

    await this.bingoParticipantRepository.remove(bingoParticipantToRemove);
  }
}
