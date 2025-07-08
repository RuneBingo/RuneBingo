import { NotFoundException } from '@nestjs/common';
import { Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { ViewBingoScope } from '@/bingo/scopes/view-bingo.scope';
import { I18nTranslations } from '@/i18n/types';
import { type User } from '@/user/user.entity';

import { BingoTile } from '../bingo-tile.entity';

export type FindBingoTilesByCoordinatesParams = {
  requester: User | undefined;
  bingoId: string;
  x: number;
  y: number;
};

export type FindBingoTilesByCoordinatesResult = BingoTile | null;

export class FindBingoTilesByCoordinatesQuery extends Query<FindBingoTilesByCoordinatesResult> {
  constructor(public readonly params: FindBingoTilesByCoordinatesParams) {
    super();
  }
}

@QueryHandler(FindBingoTilesByCoordinatesQuery)
export class FindBingoTilesByCoordinatesHandler {
  constructor(
    @InjectRepository(Bingo) private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoTile) private readonly bingoTileRepository: Repository<BingoTile>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async execute(query: FindBingoTilesByCoordinatesQuery): Promise<FindBingoTilesByCoordinatesResult> {
    const { requester, bingoId, x, y } = query.params;

    let bingoScope = this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingo_id = :bingoId', { bingoId });
    bingoScope = new ViewBingoScope(requester, bingoScope).resolve();

    const bingo = await bingoScope.getOne();
    if (!bingo) {
      throw new NotFoundException(this.i18n.t('bingo.tile.findBingoTileByCoordinates.bingoNotFound'));
    }

    const bingoTile = await this.bingoTileRepository.findOne({
      where: { bingoId: bingo.id, x, y },
      relations: ['media', 'items', 'items.osrsItem'],
    });

    return bingoTile;
  }
}
