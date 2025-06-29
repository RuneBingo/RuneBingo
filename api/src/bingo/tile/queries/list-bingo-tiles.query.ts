import { NotFoundException } from '@nestjs/common';
import { Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { ViewBingoScope } from '@/bingo/scopes/view-bingo.scope';
import { I18nTranslations } from '@/i18n/types';
import { type User } from '@/user/user.entity';

import { type BingoTile } from '../bingo-tile.entity';

export type ListBingoTilesParams = {
  requester: User | undefined;
  bingoId: string;
};

export type ListBingoTilesResult = BingoTile[];

export class ListBingoTilesQuery extends Query<ListBingoTilesResult> {
  constructor(public readonly params: ListBingoTilesParams) {
    super();
  }
}

@QueryHandler(ListBingoTilesQuery)
export class ListBingoTilesHandler {
  constructor(
    @InjectRepository(Bingo) private readonly bingoRepository: Repository<Bingo>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async execute(query: ListBingoTilesQuery): Promise<ListBingoTilesResult> {
    const { requester, bingoId } = query.params;

    let bingoScope = this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingo_id = :bingoId', { bingoId });
    bingoScope = new ViewBingoScope(requester, bingoScope).resolve();

    const bingo = await bingoScope.getOne();
    if (!bingo) {
      throw new NotFoundException(this.i18n.t('bingo.tile.listBingoTiles.bingoNotFound'));
    }

    return bingo.tiles;
  }
}
