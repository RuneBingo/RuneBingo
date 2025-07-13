import { NotFoundException } from '@nestjs/common';
import { Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { ViewBingoScope } from '@/bingo/scopes/view-bingo.scope';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import {
  PaginatedQueryParams,
  PaginatedResultWithoutTotal,
  resolvePaginatedQueryWithoutTotal,
} from '@/db/paginated-query.utils';
import { I18nTranslations } from '@/i18n/types';
import { User } from '@/user/user.entity';

import { BingoParticipant } from '../bingo-participant.entity';
import { bingoRoleHierarchy, BingoRoles } from '../roles/bingo-roles.constants';
import { ViewBingoParticipantsScope } from '../scopes/view-bingo-participants.scope';

export type SearchBingoParticipantsParams = PaginatedQueryParams<{
  bingoId: string;
  requester: User;
  query?: string;
  teamName?: string;
  role?: BingoRoles;
  sort: 'username' | 'role' | 'teamName';
  order: 'ASC' | 'DESC';
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
    const { bingoId, requester, query: searchQuery, teamName, role, sort, order, ...pagination } = query.params;

    const bingoScope = new ViewBingoScope(
      requester,
      this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingo_id = :bingoId', { bingoId }),
    ).resolve();

    const bingo = await bingoScope.getOne();
    if (!bingo) {
      throw new NotFoundException(this.i18nService.t('bingo-participant.searchBingoParticipants.bingoNotFound'));
    }

    let scope = this.bingoParticipantRepository
      .createQueryBuilder('bingo_participant')
      .innerJoin(User, 'user', 'user.id = bingo_participant.user_id')
      .leftJoin(BingoTeam, 'bingo_team', 'bingo_participant.team_id = bingo_team.id')
      .where('bingo_participant.bingo_id = :bingoId', { bingoId: bingo.id });

    if (searchQuery) {
      scope.andWhere('(user.username_normalized ILIKE :searchQuery OR bingo_team.name_normalized ILIKE :searchQuery)', {
        searchQuery: `%${searchQuery}%`,
      });
    }
    scope = new ViewBingoParticipantsScope(requester, scope, bingo).resolve();

    if (teamName) {
      scope.andWhere('bingo_team.name_normalized ILIKE :teamName', { teamName: `%${teamName}%` });
    }

    if (role) {
      scope.andWhere('bingo_participant.role = :role', { role });
    }

    scope = this.applySortOrder(scope, sort, order);

    return resolvePaginatedQueryWithoutTotal(scope, pagination);
  }

  private applySortOrder(
    scope: SelectQueryBuilder<BingoParticipant>,
    sort: SearchBingoParticipantsParams['sort'],
    order: SearchBingoParticipantsParams['order'],
  ) {
    if (sort === 'username') {
      return scope
        .addSelect('user.usernameNormalized', 'user_username_normalized') // Do not remove or else TypeORM will not properly hydrate the entity
        .orderBy('user_username_normalized', order);
    }

    if (sort === 'teamName') {
      return scope
        .addSelect('bingo_team.name_normalized', 'bingo_team_name_normalized') // Do not remove or else TypeORM will not properly hydrate the entity
        .orderBy('bingo_team_name_normalized', order);
    }

    const roleOrderAlias = 'role_order';
    const roleCaseExpression = `CASE bingo_participant.role ${bingoRoleHierarchy
      .map((role, index) => `WHEN '${role}' THEN ${index}`)
      .join(' ')} ELSE ${bingoRoleHierarchy.length} END`;

    scope = scope.addSelect(roleCaseExpression, roleOrderAlias);

    return scope.orderBy(roleOrderAlias, order);
  }
}
