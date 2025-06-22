import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
// eslint-disable-next-line import/named
import { DataSource, In, QueryRunner, Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoPolicies } from '@/bingo/bingo.policies';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { ViewBingoScope } from '@/bingo/scopes/view-bingo.scope';
import { I18nTranslations } from '@/i18n/types';
import { Media } from '@/media/media.entity';
import { OsrsItem } from '@/osrs/item/osrs-item.entity';
import { type User } from '@/user/user.entity';

import { BingoTileItem } from '../bingo-tile-item';
import { BingoTile } from '../bingo-tile.entity';
import { CreateOrEditBingoTileItemDto, type CreateOrEditBingoTileDto } from '../dto/create-or-edit-bingo-tile.dto';
import { BingoTileSetEvent } from '../events/bingo-tile-set.event';

export type CreateOrEditBingoTileParams = {
  requester: User;
  bingoId: string;
  x: number;
  y: number;
  data: CreateOrEditBingoTileDto;
};

export type CreateOrEditBingoTileResult = BingoTile;

export class CreateOrEditBingoTileCommand extends Command<CreateOrEditBingoTileResult> {
  constructor(public readonly params: CreateOrEditBingoTileParams) {
    super();
  }
}

@CommandHandler(CreateOrEditBingoTileCommand)
export class CreateOrEditBingoTileCommandHandler {
  constructor(
    private readonly eventBus: EventBus,
    private readonly i18nService: I18nService<I18nTranslations>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    @InjectRepository(BingoTile)
    private readonly bingoTileRepository: Repository<BingoTile>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(OsrsItem)
    private readonly osrsItemRepository: Repository<OsrsItem>,
  ) {}

  async execute(command: CreateOrEditBingoTileCommand): Promise<BingoTile> {
    const { requester, bingoId, x, y, data } = command.params;

    let bingoScope = this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingo_id = :bingoId', { bingoId });
    bingoScope = new ViewBingoScope(requester, bingoScope).resolve();

    const bingo = await bingoScope.getOne();
    if (!bingo) {
      throw new NotFoundException(
        this.i18nService.t('bingo.tile.createOrEditBingoTile.bingoNotFound', {
          args: {
            bingoId,
          },
        }),
      );
    }

    if (x <= 0 || x > bingo.width) {
      throw new BadRequestException(
        this.i18nService.t('bingo.tile.createOrEditBingoTile.badCoordinates', {
          args: {
            coordinate: 'x',
            max: bingo.width,
          },
        }),
      );
    }

    if (y <= 0 || y > bingo.height) {
      throw new BadRequestException(
        this.i18nService.t('bingo.tile.createOrEditBingoTile.badCoordinates', {
          args: {
            coordinate: 'y',
            max: bingo.height,
          },
        }),
      );
    }

    const bingoParticipant = await this.bingoParticipantRepository.findOneBy({
      bingoId: bingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester).canCreateOrEditTile(bingoParticipant, bingo)) {
      throw new ForbiddenException(this.i18nService.t('bingo.tile.createOrEditBingoTile.forbidden'));
    }

    let bingoTile = await this.bingoTileRepository.findOne({
      where: { bingoId: bingo.id, x, y },
      relations: ['items'],
    });

    const { mediaId, items, ...restData } = data;

    bingoTile ??= this.createAndValidateBingoTile(requester, bingo, x, y, restData);

    Object.assign(bingoTile, restData);
    bingoTile.updatedBy = Promise.resolve(requester);
    bingoTile.updatedById = requester.id;

    let result: BingoTile;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      // Save once to ensure we have a bingo ID for the items
      await queryRunner.startTransaction();
      await queryRunner.manager.save(bingoTile);
      bingoTile = await queryRunner.manager.findOneByOrFail(BingoTile, { bingoId: bingo.id, x, y });

      if (mediaId !== undefined) await this.validateAndAssignMedia(bingoTile, mediaId);
      result = await queryRunner.manager.save(bingoTile);

      if (items !== undefined) await this.validateAndUpdateItems(queryRunner, requester, bingoTile, items);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.eventBus.publish(
      new BingoTileSetEvent({
        requesterId: requester.id,
        bingoId: bingo.id,
        x,
        y,
        mediaId,
        items: items?.map((item) => ({ itemId: item.itemId, quantity: item.quantity ?? 1 })),
        ...restData,
      }),
    );

    return result;
  }

  private createAndValidateBingoTile(
    requester: User,
    bingo: Bingo,
    x: number,
    y: number,
    data: CreateOrEditBingoTileDto,
  ) {
    const { title, value, free, completionMode } = data;
    if (!title || value === undefined || free === undefined || completionMode === undefined) {
      throw new BadRequestException(this.i18nService.t('bingo.tile.createOrEditBingoTile.missingFieldsOnCreate'));
    }

    const bingoTile = new BingoTile();
    bingoTile.bingo = Promise.resolve(bingo);
    bingoTile.bingoId = bingo.id;
    bingoTile.x = x;
    bingoTile.y = y;
    bingoTile.createdBy = Promise.resolve(requester);
    bingoTile.createdById = requester.id;
    bingoTile.updatedBy = Promise.resolve(requester);
    bingoTile.updatedById = requester.id;

    return bingoTile;
  }

  private async validateAndAssignMedia(bingoTile: BingoTile, mediaId: string | null) {
    if (mediaId === null) {
      bingoTile.media = Promise.resolve(null);
      bingoTile.mediaId = null;
      return;
    }

    const media = await this.mediaRepository.findOneBy({ publicId: mediaId });
    if (!media) {
      throw new NotFoundException(
        this.i18nService.t('bingo.tile.createOrEditBingoTile.mediaNotFound', {
          args: {
            mediaId,
          },
        }),
      );
    }

    bingoTile.media = Promise.resolve(media);
    bingoTile.mediaId = media.id;
  }

  private async validateAndUpdateItems(
    queryRunner: QueryRunner,
    requester: User,
    bingoTile: BingoTile,
    items: CreateOrEditBingoTileItemDto[],
  ) {
    const hasChanges = await this.tileHasItemChanges(bingoTile, items);
    if (!hasChanges) return;

    const itemsToDelete = await bingoTile.items;
    if (itemsToDelete?.length) {
      await queryRunner.manager.remove(itemsToDelete);
      bingoTile.items = Promise.resolve([]);
    }

    if (items.length === 0) return;

    const osrsItems = await this.osrsItemRepository.findBy({ id: In(items.map(({ itemId }) => itemId)) });

    const itemsToSave = items.map(({ itemId, quantity }, index) => {
      const osrsItem = osrsItems.find(({ id }) => id === itemId);
      if (!osrsItem) {
        throw new NotFoundException(
          this.i18nService.t('bingo.tile.createOrEditBingoTile.itemNotFound', {
            args: { itemId },
          }),
        );
      }

      const bingoTileItem = new BingoTileItem();
      bingoTileItem.bingoTileId = bingoTile.id;
      bingoTileItem.bingoTile = Promise.resolve(bingoTile);
      bingoTileItem.osrsItemId = itemId;
      bingoTileItem.osrsItem = Promise.resolve(osrsItem);
      bingoTileItem.index = index;
      bingoTileItem.quantity = quantity ?? 1;
      bingoTileItem.createdById = requester.id;
      bingoTileItem.createdBy = Promise.resolve(requester);
      bingoTileItem.updatedById = requester.id;
      bingoTileItem.updatedBy = Promise.resolve(requester);

      return bingoTileItem;
    });

    await queryRunner.manager.save(itemsToSave);
    bingoTile.items = Promise.resolve(itemsToSave);
  }

  private async tileHasItemChanges(bingoTile: BingoTile, items: CreateOrEditBingoTileItemDto[]) {
    const existingItems = await bingoTile.items;
    if (!existingItems || existingItems.length !== items.length) return true;

    let changesFound = false;
    for (let i = 0; i < existingItems.length; i++) {
      const existingItem = existingItems[i];
      const item = items[i];
      if (
        existingItem.osrsItemId !== item.itemId ||
        existingItem.quantity !== item.quantity ||
        existingItem.index !== i
      ) {
        changesFound = true;
        break;
      }
    }

    return changesFound;
  }
}
