import { Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { In, Repository } from 'typeorm';

import { I18nTranslations } from '@/i18n/types';

import { FormatUserActivitiesCommand, FormatUserActivitiesResult } from './format-user-activities.command';
import { Activity } from '../../activity/activity.entity';
import { ActivityDto } from '../../activity/dto/activity.dto';
import { Roles } from '../../auth/roles/roles.constants';
import { UserDto } from '../dto/user.dto';
import { User } from '../user.entity';

@CommandHandler(FormatUserActivitiesCommand)
export class FormatUserActivitiesHandler {
  private readonly logger = new Logger(FormatUserActivitiesHandler.name);
  private usersMap = new Map<number, UserDto>();

  constructor(
    private readonly i18nService: I18nService<I18nTranslations>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async execute(command: FormatUserActivitiesCommand): Promise<FormatUserActivitiesResult> {
    const { activities } = command;

    await this.preloadUsers(activities);

    const activitiesDto = await Promise.all(
      activities.map(async (activity) => {
        switch (activity.key) {
          case 'user.created':
            return this.formatUserCreatedActivity(activity);
          case 'user.updated':
            return this.formatUserUpdatedActivity(activity);
          default:
            this.logger.error(`Unsupported activity key: ${activity.key}`);
            return null;
        }
      }),
    );

    return activitiesDto.filter(Boolean) as ActivityDto<UserDto>[];
  }

  private async preloadUsers(activities: Activity[]): Promise<void> {
    const userIds = activities.flatMap(
      (activity) => [activity.trackableId, activity.createdBy].filter(Boolean) as number[],
    );

    const users = await this.userRepository.find({ where: { id: In(userIds) } });

    users.forEach((user) => {
      this.usersMap.set(user.id, new UserDto(user));
    });
  }

  private async getUserById(id: number): Promise<UserDto> {
    if (this.usersMap.has(id)) {
      return this.usersMap.get(id)!;
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .withDeleted()
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(this.i18nService.t('user.formatUserActivities.userNotFound', { args: { id } }));
    }

    const userDto = new UserDto(user);
    this.usersMap.set(id, userDto);

    return userDto;
  }

  private async formatUserCreatedActivity(activity: Activity): Promise<ActivityDto<UserDto>> {
    const user = await this.getUserById(activity.trackableId);
    const requester = await this.getRequester(activity);

    const title = (() => {
      if (user === requester) {
        return this.i18nService.t('user.activity.created.title.self', { args: { username: user.username } });
      }

      const requesterName = requester?.username ?? 'System';

      return this.i18nService.t('user.activity.created.title.other', {
        args: { requesterName, username: user.username },
      });
    })();

    return new ActivityDto(requester, activity.createdAt, activity.key, user, title);
  }

  private async getRequester(activity: Activity): Promise<UserDto | null> {
    if (activity.createdBy === null) {
      return null;
    }

    return this.getUserById(activity.createdBy);
  }

  private async formatUserUpdatedActivity(activity: Activity): Promise<ActivityDto<UserDto>> {
    const user = await this.getUserById(activity.trackableId);
    const requester = await this.getRequester(activity);

    const title = (() => {
      if (user === requester) {
        return this.i18nService.t('user.activity.updated.title.self', { args: { username: user.username } });
      }

      const requesterName = requester?.username ?? 'System';

      return this.i18nService.t('user.activity.updated.title.other', {
        args: { requesterName, username: user.username },
      });
    })();

    const body: string[] = [];
    Object.entries(activity.parameters ?? {}).forEach(([key, value]) => {
      switch (key) {
        case 'username':
          body.push(this.i18nService.t('user.activity.updated.body.username', { args: { username: value } }));
          break;
        case 'language': {
          const language = this.i18nService.t(`general.language.${value as 'en' | 'fr'}`);
          body.push(this.i18nService.t('user.activity.updated.body.language', { args: { language } }));
          break;
        }
        case 'role':
          {
            const role = this.i18nService.t(`auth.roles.${value as Roles}`);
            body.push(
              this.i18nService.t('user.activity.updated.body.role', {
                args: { role },
              }),
            );
          }
          break;
        default:
          this.logger.error(`Unsupported activity parameter for 'user.updated': ${key}`);
          break;
      }
    });

    return new ActivityDto(requester, activity.createdAt, activity.key, user, title, body);
  }
}
