import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { DataSource, Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoPolicies } from '@/bingo/bingo.policies';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { ViewBingoScope } from '@/bingo/scopes/view-bingo.scope';
import { BingoTile } from '@/bingo/tile/bingo-tile.entity';
import { I18nTranslations } from '@/i18n/types';
import { Media } from '@/media/media.entity';
import { User } from '@/user/user.entity';

import { BingoTileItem } from '../bingo-tile-item';
import { BingoTileDeletedEvent } from '../events/bingo-tile-deleted.event';

export type DeleteBingoTileParams = {
  requester: User;
  bingoId: string;
  x: number;
  y: number;
};

export class DeleteBingoTileCommand {
  constructor(public readonly params: DeleteBingoTileParams) {}
}

@CommandHandler(DeleteBingoTileCommand)
export class DeleteBingoTileCommandHandler {
  constructor(
    private readonly eventBus: EventBus,
    private readonly dataSource: DataSource,
    private readonly i18nService: I18nService<I18nTranslations>,
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    @InjectRepository(BingoTile)
    private readonly bingoTileRepository: Repository<BingoTile>,
  ) {}

  async execute(command: DeleteBingoTileCommand): Promise<void> {
    const { requester, bingoId, x, y } = command.params;

    let bingoScope = this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingo_id = :bingoId', { bingoId });
    bingoScope = new ViewBingoScope(requester, bingoScope).resolve();

    const bingo = await bingoScope.getOne();
    if (!bingo) {
      throw new NotFoundException(
        this.i18nService.t('bingo.tile.deleteBingoTile.bingoNotFound', { args: { bingoId } }),
      );
    }

    if (x <= 0 || x > bingo.width) {
      throw new BadRequestException(
        this.i18nService.t('bingo.tile.deleteBingoTile.badCoordinates', {
          args: { coordinate: 'x', max: bingo.width },
        }),
      );
    }

    if (y <= 0 || y > bingo.height) {
      throw new BadRequestException(
        this.i18nService.t('bingo.tile.deleteBingoTile.badCoordinates', {
          args: { coordinate: 'y', max: bingo.height },
        }),
      );
    }

    const bingoParticipant = await this.bingoParticipantRepository.findOneBy({
      bingoId: bingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester).canDeleteTile(bingoParticipant, bingo)) {
      throw new ForbiddenException(this.i18nService.t('bingo.tile.deleteBingoTile.forbidden'));
    }

    const bingoTile = await this.bingoTileRepository.findOneBy({ bingoId: bingo.id, x, y });
    if (!bingoTile) {
      throw new NotFoundException(this.i18nService.t('bingo.tile.deleteBingoTile.tileNotFound', { args: { x, y } }));
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(BingoTileItem, { bingoTileId: bingoTile.id });
      if (bingoTile.mediaId) await queryRunner.manager.delete(Media, { id: bingoTile.mediaId });

      await queryRunner.manager.delete(BingoTile, { id: bingoTile.id });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    this.eventBus.publish(new BingoTileDeletedEvent({ requesterId: requester.id, bingoId: bingo.id, x, y }));
  }
}
