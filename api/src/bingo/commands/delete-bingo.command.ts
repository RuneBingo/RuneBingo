import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { DataSource, In, Repository } from 'typeorm';

import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';
import { BingoDeletedEvent } from '../events/bingo-deleted.event';
import { BingoTeam } from '../team/bingo-team.entity';
import { BingoTileItem } from '../tile/bingo-tile-item';
import { BingoTile } from '../tile/bingo-tile.entity';

export type DeleteBingoParams = {
  requester: User;
  bingoId: string;
};

export type DeleteBingoResult = void;

export class DeleteBingoCommand extends Command<DeleteBingoResult> {
  constructor(public readonly params: DeleteBingoParams) {
    super();
  }
}

@CommandHandler(DeleteBingoCommand)
export class DeleteBingoHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteBingoCommand): Promise<DeleteBingoResult> {
    const { requester, bingoId } = command.params;

    const bingo = await this.bingoRepository.findOneBy({ bingoId });

    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo.deleteBingo.bingoNotFound'));
    }

    const bingoParticipant = await this.bingoParticipantRepository.findOneBy({
      bingoId: bingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester, bingoParticipant).canDelete()) {
      throw new ForbiddenException(this.i18nService.t('bingo.deleteBingo.forbidden'));
    }

    await this.dataSource.transaction(async (manager) => {
      // TODO: delete all bingo completion requests
      // TODO: delete all bingo applications
      // TODO: delete all bingo invitations
      const bingoTiles = await manager.find(BingoTile, { where: { bingoId: bingo.id } });
      if (bingoTiles?.length) {
        await manager.delete(BingoTileItem, { bingoTileId: In(bingoTiles.map((tile) => tile.id)) });
        await manager.delete(BingoTile, bingoTiles);
      }

      await manager.softDelete(BingoTeam, { bingoId: bingo.id });
      await manager.delete(BingoParticipant, { bingoId: bingo.id });

      bingo.deletedAt = new Date();
      bingo.deletedById = requester.id;

      await manager.save(bingo);
    });

    this.eventBus.publish(new BingoDeletedEvent({ bingoId: bingo.id, requesterId: requester.id }));
  }
}
