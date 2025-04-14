import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';
import { BingoCanceledEvent } from '../events/bingo-canceled.event';

export type CancelBingoParams = {
  requester: User;
  slug: string;
  bingo?: Bingo;
  bingoParticipant?: BingoParticipant;
};

export type CancelBingoResult = Bingo;

export class CancelBingoCommand extends Command<Bingo> {
  constructor(public readonly params: CancelBingoParams) {
    super();
  }
}

@CommandHandler(CancelBingoCommand)
export class CancelBingoHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelBingoCommand): Promise<Bingo> {
    const { requester, slug, bingo, bingoParticipant } = command.params;

    const foundBingo = bingo || await this.bingoRepository.findOneBy({ slug });

    if (!foundBingo) {
      throw new NotFoundException(this.i18nService.t('bingo.deleteBingo.bingoNotFound'));
    }

    if (foundBingo.canceledAt) {
      throw new BadRequestException(this.i18nService.t('bingo.cancelBingo.alreadyCanceled'));
    }

    const foundBingoParticipant = bingoParticipant || await this.bingoParticipantRepository.findOneBy({
      bingoId: foundBingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester).canCancel(foundBingoParticipant, foundBingo)) {
      throw new ForbiddenException(this.i18nService.t('bingo.cancelBingo.forbidden'));
    }

    foundBingo.canceledAt = new Date();
    foundBingo.canceledById = requester.id;

    const canceledBingo = await this.bingoRepository.save(foundBingo);

    this.eventBus.publish(new BingoCanceledEvent({ bingoId: foundBingo.id, requesterId: requester.id }));

    return canceledBingo;
  }
}
