import { NotFoundException } from '@nestjs/common';
import { Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { NonParticipatingBingoScope } from '../scopes/non-participating-bingo.scope';
import { ParticipatingBingoScope } from '../scopes/participating-bingo.scope';
import { ViewBingoScope } from '../scopes/view-bingo.scope';

export type FindBingoByBingoIdParams = {
  bingoId: string;
  requester: User | undefined;
  participating?: boolean;
};

export type FindBingoByBingoIdResult = Bingo;

export class FindBingoByBingoIdQuery extends Query<FindBingoByBingoIdResult> {
  constructor(public readonly params: FindBingoByBingoIdParams) {
    super();
  }
}

@QueryHandler(FindBingoByBingoIdQuery)
export class FindBingoByBingoIdHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async execute(query: FindBingoByBingoIdQuery): Promise<FindBingoByBingoIdResult> {
    const { bingoId, requester, participating } = query.params;

    let notFoundKey: 'all' | 'participating' | 'nonParticipating';
    let scope = this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingoId = :bingoId', { bingoId });

    switch (participating) {
      case undefined:
        notFoundKey = 'all';
        scope = new ViewBingoScope(requester, scope).resolve();
        break;
      case true:
        notFoundKey = 'participating';
        scope = new ParticipatingBingoScope(requester, scope).resolve();
        break;
      case false:
        notFoundKey = 'nonParticipating';
        scope = new NonParticipatingBingoScope(requester, scope).resolve();
        break;
    }

    const bingo = await scope.getOne();

    if (!bingo) {
      throw new NotFoundException(this.i18nService.t(`bingo.findBingoByBingoId.bingoNotFound.${notFoundKey}`));
    }

    return bingo;
  }
}
