import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { I18nTranslations } from '@/i18n/types';
import { type User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';
import { BingoCreatedEvent } from '../events/bingo-created.event';

export type CreateBingoParams = {
  requester: User;
  language: string;
  title: string;
  description: string;
  isPrivate: boolean;
  width: number;
  height: number;
  fullLineValue: number;
  startDate: string;
  endDate: string;
  maxRegistrationDate?: string;
};

export type CreateBingoResult = Bingo;

export class CreateBingoCommand extends Command<CreateBingoResult> {
  constructor(public readonly params: CreateBingoParams) {
    super();
  }
}

@CommandHandler(CreateBingoCommand)
export class CreateBingoHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    private readonly eventBus: EventBus,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async execute(command: CreateBingoCommand): Promise<CreateBingoResult> {
    const {
      requester,
      language,
      title,
      description,
      isPrivate,
      width,
      height,
      fullLineValue,
      startDate,
      endDate,
      maxRegistrationDate,
    } = command.params;

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    if (maxRegistrationDate && new Date(maxRegistrationDate) >= startDateObj) {
      throw new BadRequestException(this.i18nService.t('bingo.createBingo.registrationDateAfterStartDate'));
    }

    if (startDateObj >= endDateObj) {
      throw new BadRequestException(this.i18nService.t('bingo.createBingo.startDateAfterEndDate'));
    }

    const bingo = new Bingo();
    bingo.createdById = requester.id;
    bingo.language = language;
    bingo.title = title;
    bingo.description = description;
    bingo.private = isPrivate;
    bingo.width = width;
    bingo.height = height;
    bingo.fullLineValue = fullLineValue;
    bingo.startDate = startDate;
    bingo.endDate = endDate;
    bingo.maxRegistrationDate = maxRegistrationDate;
    bingo.createdById = requester.id;
    bingo.createdBy = Promise.resolve(requester);
    await this.bingoRepository.save(bingo);

    this.eventBus.publish(
      new BingoCreatedEvent({
        bingoId: bingo.id,
        requesterId: requester.id,
        language,
        title,
        description,
        private: isPrivate,
        width,
        height,
        fullLineValue,
        startDate,
        endDate,
      }),
    );

    return bingo;
  }
}
