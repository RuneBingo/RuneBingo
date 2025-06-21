import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { UpdateBingoDto } from '@/bingo/dto/update-bingo.dto';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { I18nTranslations } from '@/i18n/types';
import { type User } from '@/user/user.entity';

import { BingoStatus } from '../bingo-status.enum';
import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';
import { BingoUpdatedEvent } from '../events/bingo-updated.event';

export type UpdateBingoParams = {
  bingoId: string;
  requester: User;
  updates: UpdateBingoDto;
};

export type UpdateBingoResult = Bingo;

export class UpdateBingoCommand extends Command<Bingo> {
  public readonly bingoId: string;
  public readonly requester: User;
  public readonly updates: UpdateBingoDto;
  constructor({ bingoId, requester, updates }: UpdateBingoParams) {
    super();
    this.bingoId = bingoId;
    this.requester = requester;
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
    const { bingoId, requester } = command;

    let bingo = await this.bingoRepository.findOneBy({ bingoId });

    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo.updateBingo.bingoNotFound'));
    }

    const bingoParticipant = await this.bingoParticipantRepository.findOneBy({
      bingoId: bingo.id,
      userId: requester.id,
    });

    const updates = Object.fromEntries(
      Object.entries(command.updates).filter(([key, value]) => {
        const current = bingo![key as keyof Bingo];

        if (value === undefined) return false;

        return value !== current;
      }),
    ) as UpdateBingoParams['updates'];

    if (Object.keys(updates).length === 0) {
      return bingo;
    }

    if (!new BingoPolicies(requester).canUpdate(bingoParticipant, updates)) {
      throw new ForbiddenException(this.i18nService.t('bingo.updateBingo.forbidden'));
    }

    this.validateUpdates(bingo, updates);

    Object.assign(bingo, updates);
    bingo.updatedById = requester.id;
    bingo.updatedBy = Promise.resolve(requester);

    bingo = await this.bingoRepository.save(bingo);

    this.eventBus.publish(
      new BingoUpdatedEvent({
        bingoId: bingo.id,
        requesterId: command.requester.id,
        updates,
      }),
    );

    return bingo;
  }

  private validateUpdates(bingo: Bingo, updates: UpdateBingoDto) {
    for (const [key] of Object.entries(updates)) {
      const statusRestrictions = this.fieldUpdateStatusRestrictions[key as keyof Bingo];
      if (!statusRestrictions || statusRestrictions.includes(bingo.status)) continue;

      throw new BadRequestException(
        this.i18nService.t('bingo.updateBingo.statusRestricted', {
          args: {
            field: this.i18nService.t(`bingo.entity.${key as keyof UpdateBingoDto}`),
            status: this.i18nService.t(`bingo.status.${bingo.status}`),
          },
        }),
        {
          cause: {
            field: key,
            status: bingo.status,
          },
        },
      );
    }

    this.validateDateUpdates(bingo, updates);
  }

  private validateDateUpdates(bingo: Bingo, updates: UpdateBingoDto) {
    const newStartDate = new Date(updates.startDate || bingo.startDate);
    const newEndDate = new Date(updates.endDate || bingo.endDate);

    if (newStartDate >= newEndDate) {
      throw new BadRequestException(this.i18nService.t('bingo.updateBingo.startDateAfterEndDate'));
    }

    if (newEndDate <= newStartDate) {
      throw new BadRequestException(this.i18nService.t('bingo.updateBingo.endDateBeforeStartDate'));
    }

    if (updates.maxRegistrationDate && new Date(updates.maxRegistrationDate) >= newStartDate) {
      throw new BadRequestException(this.i18nService.t('bingo.updateBingo.registrationDateAfterStartDate'));
    }
  }

  private readonly fieldUpdateStatusRestrictions: Readonly<{ [key in keyof Bingo]?: BingoStatus[] }> = {
    language: [BingoStatus.Pending],
    title: [BingoStatus.Pending, BingoStatus.Ongoing],
    description: [BingoStatus.Pending, BingoStatus.Ongoing],
    private: [BingoStatus.Pending],
    startDate: [BingoStatus.Pending],
    endDate: [BingoStatus.Pending, BingoStatus.Ongoing],
    maxRegistrationDate: [BingoStatus.Pending],
  };
}
