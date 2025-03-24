import { NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { I18nTranslations } from '@/i18n/types';

import { FindUserByUsernameQuery, type FindUserByUsernameResult } from './find-user-by-username.query';
import { ViewUserScope } from '../scopes/view-user.scope';
import { User } from '../user.entity';

@QueryHandler(FindUserByUsernameQuery)
export class FindUserByUsernameHandler {
  constructor(
    private readonly i18nService: I18nService<I18nTranslations>,
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async execute(query: FindUserByUsernameQuery): Promise<FindUserByUsernameResult> {
    const { username, requester } = query;

    const usernameNormalized = User.normalizeUsername(username);

    const scope = this.repository
      .createQueryBuilder('user')
      .where('user.username_normalized = :usernameNormalized', { usernameNormalized });

    const user = await new ViewUserScope(requester, scope).resolve().getOne();

    if (!user) {
      throw new NotFoundException(this.i18nService.t('user.findByUsername.notFound'));
    }

    return user;
  }
}
