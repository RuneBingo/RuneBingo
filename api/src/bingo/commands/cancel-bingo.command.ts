import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';
import { BingoCanceledEvent } from '../events/bingo-canceled.event';

export type CancelBingoParams = {
  requester: User;
  bingoId: string;
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
    const { requester, bingoId } = command.params;

    const bingo = await this.bingoRepository.findOneBy({ bingoId });

    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo.deleteBingo.bingoNotFound'));
    }

    if (bingo.canceledAt) {
      throw new BadRequestException(this.i18nService.t('bingo.cancelBingo.alreadyCanceled'));
    }

    const bingoParticipant = await this.bingoParticipantRepository.findOneBy({
      bingoId: bingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester).canCancel(bingoParticipant, bingo)) {
      throw new ForbiddenException(this.i18nService.t('bingo.cancelBingo.forbidden'));
    }

    bingo.canceledAt = new Date();
    bingo.canceledById = requester.id;

    const canceledBingo = await this.bingoRepository.save(bingo);

    this.eventBus.publish(new BingoCanceledEvent({ bingoId: bingo.id, requesterId: requester.id }));

    return canceledBingo;
  }
}
