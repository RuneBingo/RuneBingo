import { NotFoundException } from '@nestjs/common';
import { Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { ViewBingoScope } from '../scopes/view-bingo.scope';

export type FindBingoBySlugParams = {
  slug: string;
  requester: User | undefined;
  bingo?: Bingo;
};

export type FindBingoBySlugResult = Bingo;

export class FindBingoBySlugQuery extends Query<FindBingoBySlugResult> {
  constructor(public readonly params: FindBingoBySlugParams) {
    super();
  }
}

@QueryHandler(FindBingoBySlugQuery)
export class FindBingoBySlugHandler {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async execute(query: FindBingoBySlugQuery): Promise<FindBingoBySlugResult> {
    const { slug, bingo } = query.params;

    if (bingo) {
      return bingo;
    }

    const existingBingo = await this.bingoRepository.findOneBy({slug});

    if (!existingBingo) {
      throw new NotFoundException(this.i18nService.t('bingo.findBingoByTitleSlug.bingoNotFound'));
    }

    return existingBingo;
  }
}
