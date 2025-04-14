import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { I18nTranslations } from '@/i18n/types';
import { type User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';
import { BingoUpdatedEvent } from '../events/bingo-updated.event';

export type UpdateBingoParams = {
  slug: string;
  requester: User;
  bingo?: Bingo;
  bingoParticipant?: BingoParticipant;
  updates: {
    language?: string;
    title?: string;
    description?: string;
    private?: boolean;
    width?: number;
    height?: number;
    fullLineValue?: number;
    startDate?: string;
    endDate?: string;
    maxRegistrationDate?: string;
  };
};

export type UpdateBingoResult = Bingo;

export class UpdateBingoCommand extends Command<Bingo> {
  public readonly slug: string;
  public readonly requester: User;
  public readonly bingo?: Bingo;
  public readonly bingoParticipant?: BingoParticipant;
  public readonly updates: {
    language?: string;
    title?: string;
    description?: string;
    private?: boolean;
    width?: number;
    height?: number;
    fullLineValue?: number;
    startDate?: string;
    endDate?: string;
    maxRegistrationDate?: string;
  };
  constructor({ slug, requester, bingo, bingoParticipant, updates }: UpdateBingoParams) {
    super();
    this.slug = slug;
    this.requester = requester;
    this.bingo = bingo;
    this.bingoParticipant = bingoParticipant;
    this.updates = updates;
  }
}

@CommandHandler(UpdateBingoCommand)
export class UpdateBingoHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateBingoCommand): Promise<UpdateBingoResult> {
    const { slug, requester, bingo, bingoParticipant } = command;

    let foundBingo = bingo || await this.bingoRepository.findOneBy({ slug });

    if (!foundBingo) {
      throw new NotFoundException(this.i18nService.t('bingo.updateBingo.bingoNotFound'));
    }

    const foundBingoParticipant = bingoParticipant || await this.bingoParticipantRepository.findOneBy({
      bingoId: foundBingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester).canUpdate(foundBingoParticipant, foundBingo)) {
      throw new ForbiddenException(this.i18nService.t('bingo.updateBingo.forbidden'));
    }

    const updates = Object.fromEntries(
      Object.entries(command.updates).filter(([key, value]) => {
        const current = foundBingo![key as keyof Bingo];

        if (value === undefined) return false;

        return value !== current;
      }),
    ) as UpdateBingoParams['updates'];

    if (Object.keys(updates).length === 0) {
      return foundBingo;
    }

    const newStartDate = new Date(updates.startDate || foundBingo.startDate);
    const newEndDate = new Date(updates.endDate || foundBingo.endDate);

    if (newStartDate >= newEndDate) {
      throw new BadRequestException(this.i18nService.t('bingo.updateBingo.startDateAfterEndDate'));
    }

    if (newEndDate <= newStartDate) {
      throw new BadRequestException(this.i18nService.t('bingo.updateBingo.endDateBeforeStartDate'));
    }

    if (updates.maxRegistrationDate && new Date(updates.maxRegistrationDate) >= newStartDate) {
      throw new BadRequestException(this.i18nService.t('bingo.updateBingo.registrationDateAfterStartDate'));
    }

    if (updates.title) {
      const titleSlug = Bingo.slugifyTitle(updates.title);

      const existingBingo = await this.bingoRepository.findOneBy({ slug: titleSlug });

      if (existingBingo) {
        throw new BadRequestException(this.i18nService.t('bingo.updateBingo.titleNotUnique'));
      }
      foundBingo.slug = titleSlug;
    }

    Object.assign(foundBingo, updates);
    foundBingo.updatedById = requester.id;
    foundBingo.updatedBy = Promise.resolve(requester);

    foundBingo = await this.bingoRepository.save(foundBingo);

    this.eventBus.publish(
      new BingoUpdatedEvent({
        bingoId: foundBingo.id,
        requesterId: command.requester.id,
        updates,
      }),
    );

    return foundBingo;
  }
}
