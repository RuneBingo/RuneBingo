import { NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { I18nTranslations } from '@/i18n/types';

import { FindUserByUsernameQuery, type FindUserByUsernameResult } from './find-user-by-username.query';
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

    const user = await this.repository.findOneBy({ usernameNormalized });
    if (!user || (user.isDisabled && (!requester || !userHasRole(requester, Roles.Moderator)))) {
      throw new NotFoundException(this.i18nService.t('user.findByUsername.notFound'));
    }

    return user;
  }
}
