import { NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { ViewBingoScope } from '@/bingo/scopes/view-bingo.scope';
import { PaginatedResultWithoutTotal, resolvePaginatedQueryWithoutTotal } from '@/db/paginated-query.utils';
import { I18nTranslations } from '@/i18n/types';

import { BingoInvitation } from '../bingo-invitation.entity';
import { SearchBingoInvitationsQuery } from './search-bingo-invitations.query';

@QueryHandler(SearchBingoInvitationsQuery)
export class SearchBingoInvitationsHandler {
  constructor(
    @InjectRepository(BingoInvitation)
    private readonly invitationRepository: Repository<BingoInvitation>,
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async execute(query: SearchBingoInvitationsQuery): Promise<PaginatedResultWithoutTotal<BingoInvitation>> {
    const {
      requester,
      bingoId,
      query: search,
      status,
      role,
      teamName,
      sort = 'createdAt',
      order = 'DESC',
      ...pagination
    } = query.params;

    const bingoScope = new ViewBingoScope(
      requester,
      this.bingoRepository.createQueryBuilder('bingo').where('bingo.bingoId = :bingoId', { bingoId }),
    ).resolve();

    const bingo = await bingoScope.getOne();
    if (!bingo) {
      throw new NotFoundException(this.i18n.t('bingo-invitation.search.bingoNotFound' as never));
    }

    let scope = this.invitationRepository
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.createdBy', 'createdBy')
      .leftJoinAndSelect('invitation.invitee', 'invitee')
      .leftJoinAndSelect('invitation.team', 'team')
      .where('invitation.bingo_id = :bingoId', { bingoId: bingo.id });

    if (search) {
      scope.andWhere('(invitation.code ILIKE :search OR team.name ILIKE :search)', { search: `%${search}%` });
    }

    if (status) {
      scope.andWhere('invitation.status = :status', { status });
    }

    if (role) {
      scope.andWhere('invitation.role = :role', { role });
    }

    if (teamName) {
      scope.andWhere('team.name_normalized ILIKE :teamName', { teamName: `%${teamName}%` });
    }

    scope = this.applySortOrder(scope, sort, order);

    return resolvePaginatedQueryWithoutTotal(scope, pagination);
  }

  private applySortOrder(
    scope: SelectQueryBuilder<BingoInvitation>,
    sort: NonNullable<SearchBingoInvitationsQuery['params']['sort']>,
    order: 'ASC' | 'DESC',
  ) {
    switch (sort) {
      case 'username':
        return scope.orderBy('invitation.invitee_id', order); // simplified – invitee username resolved later
      case 'status':
        return scope.orderBy('invitation.status', order);
      case 'teamName':
        // For now, just sort by invitation ID to avoid TypeORM issues
        return scope.orderBy('invitation.id', order);
      default:
        return scope.orderBy('invitation.createdAt', order);
    }
  }
}
