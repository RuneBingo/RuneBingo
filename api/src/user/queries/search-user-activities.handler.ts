import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Activity } from '@/activity/activity.entity';
import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { resolvePaginatedQueryWithoutTotal } from '@/db/paginated-query.utils';
import { I18nTranslations } from '@/i18n/types';

import { User } from '../user.entity';
import { SearchUserActivitiesQuery, type SearchUserActivitiesResult } from './search-user-activities.query';

@QueryHandler(SearchUserActivitiesQuery)
export class SearchUserActivitiesHandler {
  constructor(
    private readonly i18nService: I18nService<I18nTranslations>,
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: SearchUserActivitiesQuery): Promise<SearchUserActivitiesResult> {
    const { requester, username, ...pagination } = query.params;

    const usernameNormalized = User.normalizeUsername(username);
    const user = await this.userRepository.findOneBy({ usernameNormalized });
    if (!user) {
      throw new NotFoundException(this.i18nService.t('user.searchUserActivities.userNotFound'));
    }

    if (user.id !== requester.id && !userHasRole(requester, Roles.Admin)) {
      throw new ForbiddenException();
    }

    const q = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.trackable_type = :type', { type: 'User' })
      .andWhere('activity.trackable_id = :id', { id: user.id })
      .orderBy('activity.created_at', 'DESC');

    return resolvePaginatedQueryWithoutTotal(q, pagination);
  }
}
