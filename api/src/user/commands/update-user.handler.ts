import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Roles } from '@/auth/roles/roles.constants';
import { userHasRole } from '@/auth/roles/roles.utils';
import { I18nTranslations } from '@/i18n/types';

import { User } from '../user.entity';
import { UpdateUserCommand, UpdateUserParams, UpdateUserResult } from './update-user.command';
import { UserUpdatedEvent } from '../events/user-updated.event';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler {
  constructor(
    private readonly eventBus: EventBus,
    private readonly i18nService: I18nService<I18nTranslations>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UpdateUserResult> {
    const { requester, username } = command;

    const usernameNormalized = User.normalizeUsername(username);
    let user = await this.userRepository.findOneBy({ usernameNormalized });
    if (!user) {
      throw new NotFoundException(this.i18nService.t('user.updateUser.userNotFound'));
    }

    if (requester.id !== user.id && !userHasRole(requester, Roles.Moderator)) {
      throw new ForbiddenException();
    }

    const updates = Object.fromEntries(
      Object.entries(command.updates).filter(([key, value]) => value !== undefined && value !== user![key]),
    ) as UpdateUserParams['updates'];

    if (Object.keys(updates).length === 0) {
      return user;
    }

    if (updates.role && !userHasRole(requester, Roles.Admin)) {
      throw new ForbiddenException();
    }

    if (updates.username) {
      const userByUsername = await this.userRepository.findOneBy({
        usernameNormalized: User.normalizeUsername(updates.username),
      });

      if (userByUsername && userByUsername.id !== user.id) {
        throw new ConflictException(this.i18nService.t('user.updateUser.usernameAlreadyExists'));
      }

      user.username = updates.username;
      user.usernameNormalized = User.normalizeUsername(updates.username);
    }

    if (updates.language) {
      user.language = updates.language;
    }

    if (updates.role) {
      user.role = updates.role;
    }

    user = await this.userRepository.save(user);

    this.eventBus.publish(new UserUpdatedEvent({ userId: user.id, requesterId: requester.id, updates }));

    return user;
  }
}
