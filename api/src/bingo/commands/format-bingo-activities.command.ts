import { Logger } from '@nestjs/common';
import { Command, CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { In, Repository } from 'typeorm';

import { type Activity } from '@/activity/activity.entity';
import { ActivityDto } from '@/activity/dto/activity.dto';
import { I18nTranslations } from '@/i18n/types';
import { UserDto } from '@/user/dto/user.dto';
import { User } from '@/user/user.entity';

export type FormatBingoActivitiesResult = ActivityDto[];

export class FormatBingoActivitiesCommand extends Command<FormatBingoActivitiesResult> {
  constructor(public readonly activities: Activity[]) {
    super();
  }
}

@CommandHandler(FormatBingoActivitiesCommand)
export class FormatBingoActivitiesHandler {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18nService: I18nService<I18nTranslations>,
  ) {}

  private readonly logger = new Logger(FormatBingoActivitiesHandler.name);
  private readonly usersMap = new Map<number, UserDto>();

  async execute(command: FormatBingoActivitiesCommand): Promise<FormatBingoActivitiesResult> {
    const { activities } = command;
    await this.preloadUsers(command.activities);

    const activitiesDto = await Promise.all(
      activities.map((activity) => {
        switch (activity.key) {
          case 'bingo.created':
            return this.formatBingoCreatedActivity(activity);
          case 'bingo.updated':
            return this.formatBingoUpdatedActivity(activity);
          case 'bingo.canceled':
            return this.formatBingoCanceledActivity(activity);
          case 'bingo.deleted':
            return this.formatBingoDeletedActivity(activity);
          default:
            this.logger.error(`Unsupported activity key: ${activity.key}`);
            return null;
        }
      }),
    );

    return activitiesDto.filter(Boolean) as ActivityDto[];
  }

  private formatBingoCreatedActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? 'System';
    const title = this.i18nService.t('bingo.activity.created.title', {
      args: { username: requesterName },
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title);
  }

  private formatBingoUpdatedActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? 'System';
    const title = this.i18nService.t('bingo.activity.updated.title', {
      args: { username: requesterName },
    });

    const body: string[] = [];

    Object.entries(activity.parameters ?? {}).forEach(([key, value]) => {
      switch (key) {
        case 'language':
          body.push(this.i18nService.t('bingo.activity.updated.body.language', { args: { language: value } }));
          break;
        case 'title':
          body.push(this.i18nService.t('bingo.activity.updated.body.title', { args: { title: value } }));
          break;
        case 'description':
          body.push(this.i18nService.t('bingo.activity.updated.body.description', { args: { description: value } }));
          break;
        case 'private':
          body.push(this.i18nService.t('bingo.activity.updated.body.private', { args: { private: value } }));
          break;
        case 'width':
          body.push(this.i18nService.t('bingo.activity.updated.body.width', { args: { width: value } }));
          break;
        case 'height':
          body.push(this.i18nService.t('bingo.activity.updated.body.height', { args: { height: value } }));
          break;
        case 'fullLineValue':
          body.push(
            this.i18nService.t('bingo.activity.updated.body.fullLineValue', { args: { fullLineValue: value } }),
          );
          break;
        case 'startDate':
          body.push(this.i18nService.t('bingo.activity.updated.body.startDate', { args: { startDate: value } }));
          break;
        case 'endDate':
          body.push(this.i18nService.t('bingo.activity.updated.body.endDate', { args: { endDate: value } }));
          break;
        default:
          this.logger.error(`Unsupported activity parameter for 'bingo.update': ${key}`);
          break;
      }
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title, body);
  }

  private formatBingoDeletedActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? 'System';
    const title = this.i18nService.t('bingo.activity.deleted.title', {
      args: { username: requesterName },
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title);
  }

  private formatBingoCanceledActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? 'System';
    const title = this.i18nService.t('bingo.activity.canceled.title', {
      args: { username: requesterName },
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title);
  }

  private async preloadUsers(activities: Activity[]): Promise<void> {
    const userIds = activities.map((activity) => activity.createdById).filter(Boolean) as number[];

    const users = await this.userRepository.find({ where: { id: In(userIds) } });

    users.forEach((user) => {
      this.usersMap.set(user.id, new UserDto(user));
    });
  }
}
