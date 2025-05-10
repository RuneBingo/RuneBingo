import { Query, QueryHandler } from '@nestjs/cqrs';
import { BingoParticipant } from '../bingo-participant.entity';
import {
  PaginatedQueryParams,
  PaginatedResultWithoutTotal,
  resolvePaginatedQueryWithoutTotal,
} from '@/db/paginated-query.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '@/user/user.entity';
import { Bingo } from '@/bingo/bingo.entity';
import { NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/i18n/types';
import { ViewBingoScope } from '@/bingo/scopes/view-bingo.scope';
import { ViewBingoParticipantsScope } from '../scopes/view-bingo-participants.scope';
import { BingoTeam } from '@/bingo-team/bingo-team.entity';

export type SearchBingoParticipantsParams = PaginatedQueryParams<{
  slug: string;
  requester: User | undefined;
  bingo?: Bingo;
  bingoParticipant?: BingoParticipant;
  query?: string;
  teamName?: string;
  role?: string;
}>;

export type SearchBingoParticipantsResult = PaginatedResultWithoutTotal<BingoParticipant>;

export class SearchBingoParticipantsQuery extends Query<SearchBingoParticipantsResult> {
  constructor(public readonly params: SearchBingoParticipantsParams) {
    super();
  }
}

@QueryHandler(SearchBingoParticipantsQuery)
export class SearchBingoParticipantsHandler {
  constructor(
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  async execute(query: SearchBingoParticipantsQuery): Promise<SearchBingoParticipantsResult> {
    const {
      slug,
      requester,
      bingo,
      bingoParticipant,
      query: searchQuery,
      teamName,
      role,
      ...pagination
    } = query.params;

    const foundBingo = bingo || (await this.bingoRepository.findOneBy({ slug }));

    if (!foundBingo) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.searchBingoParticipants.bingoNotFound'));
    }

    let scope = this.bingoParticipantRepository
      .createQueryBuilder('bingo_participant')
      .innerJoin(User, 'user', 'user.id = bingo_participant.user_id')
      .leftJoin(BingoTeam, 'bingo_team', 'bingo_participant.team_id = bingo_team.id')
      .where('bingo_participant.bingo_id = :bingoId', { bingoId: foundBingo.id });
    if (searchQuery) {
      scope.andWhere('(user.username_normalized ILIKE :searchQuery OR bingo_team.name_normalized ILIKE :searchQuery)', {
        searchQuery: `%${searchQuery}%`,
      });
    }

    if (teamName) {
      scope.andWhere('bingo_team.name_normalized ILIKE :teamName', {teamName: `%${teamName}%`});
    }

    if (role) {
      scope.andWhere('bingo_participant.role = :role', { role });
    }

    return resolvePaginatedQueryWithoutTotal(scope, pagination);
  }
}
