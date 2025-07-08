import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { DataSource, In, Repository } from 'typeorm';

import { UpdateBingoDto } from '@/bingo/dto/update-bingo.dto';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { I18nTranslations } from '@/i18n/types';
import { type User } from '@/user/user.entity';

import { BingoStatus } from '../bingo-status.enum';
import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';
import { BingoUpdatedEvent } from '../events/bingo-updated.event';
import { BingoTileItem } from '../tile/bingo-tile-item';
import { BingoTile } from '../tile/bingo-tile.entity';

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
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateBingoCommand): Promise<UpdateBingoResult> {
    const { bingoId, requester } = command;
    const { confirmTileDeletion, ...updates } = command.updates;

    let bingo = await this.bingoRepository.findOneBy({ bingoId });

    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo.updateBingo.bingoNotFound'));
    }

    const bingoParticipant = await this.bingoParticipantRepository.findOneBy({
      bingoId: bingo.id,
      userId: requester.id,
    });

    const filteredUpdates = Object.fromEntries(
      Object.entries(command.updates).filter(([key, value]) => {
        if (key === 'confirmTileDeletion') return false;

        const current = bingo![key as keyof Bingo];
        if (value === undefined) return false;

        return value !== current;
      }),
    ) as UpdateBingoParams['updates'];

    if (Object.keys(updates).length === 0) {
      return bingo;
    }

    if (!new BingoPolicies(requester).canUpdate(bingoParticipant, filteredUpdates)) {
      throw new ForbiddenException(this.i18nService.t('bingo.updateBingo.forbidden'));
    }

    this.validateUpdates(bingo, filteredUpdates);
    const tilesToDelete = await this.getAndValidateTilesToDelete(bingo, filteredUpdates, confirmTileDeletion);

    Object.assign(bingo, filteredUpdates);
    bingo.updatedById = requester.id;
    bingo.updatedBy = Promise.resolve(requester);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (tilesToDelete?.length) {
        await queryRunner.manager.delete(BingoTileItem, { bingoTileId: In(tilesToDelete.map((tile) => tile.id)) });
        await queryRunner.manager.delete(BingoTile, tilesToDelete);
      }

      bingo = await queryRunner.manager.save(Bingo, bingo);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    this.eventBus.publish(
      new BingoUpdatedEvent({
        bingoId: bingo.id,
        requesterId: command.requester.id,
        updates: filteredUpdates,
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
            field: this.i18nService.t(`bingo.entity.${key as keyof Omit<UpdateBingoDto, 'confirmTileDeletion'>}`),
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

  private async getAndValidateTilesToDelete(
    bingo: Bingo,
    updates: UpdateBingoDto,
    confirmTileDeletion: boolean | undefined,
  ) {
    if (updates.width === undefined && updates.height === undefined) return [];

    const newWidth = updates.width ?? bingo.width;
    const newHeight = updates.height ?? bingo.height;

    const tiles = await bingo.tiles;
    const tilesToDelete = tiles?.filter((tile) => tile.x > newWidth || tile.y > newHeight) ?? [];
    if (tilesToDelete.length === 0) return [];

    if (!confirmTileDeletion) {
      if (tilesToDelete.length === 1) {
        throw new ConflictException(this.i18nService.t('bingo.updateBingo.tileDeletionNotConfirmed.singular'));
      }

      throw new ConflictException(
        this.i18nService.t('bingo.updateBingo.tileDeletionNotConfirmed.plural', {
          args: {
            count: tilesToDelete.length,
          },
        }),
      );
    }

    return tilesToDelete;
  }

  private readonly fieldUpdateStatusRestrictions: Readonly<{ [key in keyof Bingo]?: BingoStatus[] }> = {
    language: [BingoStatus.Pending],
    title: [BingoStatus.Pending, BingoStatus.Ongoing],
    description: [BingoStatus.Pending, BingoStatus.Ongoing],
    private: [BingoStatus.Pending],
    startDate: [BingoStatus.Pending],
    endDate: [BingoStatus.Pending, BingoStatus.Ongoing],
    maxRegistrationDate: [BingoStatus.Pending],
    width: [BingoStatus.Pending],
    height: [BingoStatus.Pending],
    fullLineValue: [BingoStatus.Pending],
  };
}
