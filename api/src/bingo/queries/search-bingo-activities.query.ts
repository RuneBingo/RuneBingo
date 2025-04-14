import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Activity } from '@/activity/activity.entity';
import { BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { type PaginatedDtoWithoutTotal } from '@/db/dto/paginated.dto';
import { resolvePaginatedQueryWithoutTotal, type PaginatedQueryParams } from '@/db/paginated-query.utils';
import { I18nTranslations } from '@/i18n/types';
import { type User } from '@/user/user.entity';

import { Bingo } from '../bingo.entity';
import { BingoPolicies } from '../bingo.policies';

export type SearchBingoActivitiesParams = PaginatedQueryParams<{
  requester: User;
  slug: string;
  bingo?: Bingo;
  bingoParticipant?: BingoParticipant;
}>;

export type SearchBingoActivitiesResult = PaginatedDtoWithoutTotal<Activity>;

export class SearchBingoActivitiesQuery extends Query<SearchBingoActivitiesResult> {
  constructor(public readonly params: SearchBingoActivitiesParams) {
    super();
  }
}

@QueryHandler(SearchBingoActivitiesQuery)
export class SearchBingoActivitiesHandler {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async execute(query: SearchBingoActivitiesQuery): Promise<SearchBingoActivitiesResult> {
    const { requester, slug, bingo, bingoParticipant, ...pagination } = query.params;

    const foundBingo = bingo || await this.bingoRepository.findOneBy({ slug });

    if (!foundBingo) {
      throw new NotFoundException(this.i18nService.t('bingo.searchBingoActivities.bingoNotFound'));
    }

    const foundBingoParticipant = bingoParticipant || await this.bingoParticipantRepository.findOneBy({
      bingoId: foundBingo.id,
      userId: requester.id,
    });

    if (!new BingoPolicies(requester).canViewActivities(foundBingoParticipant)) {
      throw new ForbiddenException(this.i18nService.t('bingo.activity.forbidden'));
    }

    const q = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.trackable_id = :trackableId AND activity.trackable_type = :type', {
        trackableId: foundBingo.id,
        type: 'Bingo',
      })
      .orderBy('activity.createdAt', 'DESC');

    return resolvePaginatedQueryWithoutTotal(q, pagination);
  }
}
