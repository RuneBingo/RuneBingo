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
          case 'bingo.participant.added':
            return this.formatBingoParticipantAddedActivity(activity);
          case 'bingo.participant.removed':
            return this.formatBingoParticipantRemovedActivity(activity);
          case 'bingo.participant.updated':
            return this.formatBingoParticipantUpdatedActivity(activity);
          case 'bingo.tile.set':
            return this.formatBingoTileSetActivity(activity);
          case 'bingo.tile.deleted':
            return this.formatBingoTileDeletedActivity(activity);
          case 'bingo.tile.moved':
            return this.formatBingoTileMovedActivity(activity);
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
    const requesterName = requester?.username ?? this.i18nService.t('general.system');
    const title = this.i18nService.t('bingo.activity.created.title', {
      args: { username: requesterName },
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title);
  }

  private formatBingoUpdatedActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? this.i18nService.t('general.system');
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
    const requesterName = requester?.username ?? this.i18nService.t('general.system');
    const title = this.i18nService.t('bingo.activity.deleted.title', {
      args: { username: requesterName },
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title);
  }

  private formatBingoCanceledActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? this.i18nService.t('general.system');
    const title = this.i18nService.t('bingo.activity.canceled.title', {
      args: { username: requesterName },
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title);
  }

  private formatBingoParticipantAddedActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? this.i18nService.t('general.system');

    const userId = activity.parameters?.userId as number | undefined;

    const username =
      userId !== undefined && this.usersMap.has(userId) ? this.usersMap.get(userId)!.username : 'Unknown';

    const title = this.i18nService.t('bingo-participant.activity.added', {
      args: { username: username, requester: requesterName },
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title);
  }

  private formatBingoParticipantRemovedActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? this.i18nService.t('general.system');
    const removedUsername = activity.parameters!.username;

    const title = this.i18nService.t('bingo-participant.activity.removed', {
      args: { username: removedUsername, requester: requesterName },
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title);
  }

  private formatBingoParticipantUpdatedActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? this.i18nService.t('general.system');
    const updatedUsername = activity.parameters!.username;
    const title = this.i18nService.t('bingo.activity.updated.title', {
      args: { username: requesterName },
    });

    const body: string[] = [];

    Object.entries((activity.parameters?.updates as Record<string, unknown>) ?? {}).forEach(([key, value]) => {
      switch (key) {
        case 'role':
          body.push(
            this.i18nService.t('bingo-participant.activity.updated.role', {
              args: { requester: requesterName, username: updatedUsername, role: value },
            }),
          );
          break;
        case 'teamName':
          body.push(
            this.i18nService.t('bingo-participant.activity.updated.teamName', {
              args: { requester: requesterName, username: updatedUsername, role: value },
            }),
          );
          break;
        default:
          this.logger.error(`Unsupported activity parameter for 'bingo.update': ${key}`);
          break;
      }
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title, body);
  }

  private formatBingoTileSetActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? this.i18nService.t('general.system');
    const title = this.i18nService.t('bingo.tile.activity.set.title', {
      args: { username: requesterName, x: activity.parameters?.x, y: activity.parameters?.y },
    });

    const body: string[] = [];

    Object.entries(activity.parameters ?? {}).forEach(([key, value]) => {
      switch (key) {
        case 'title':
          body.push(this.i18nService.t('bingo.tile.activity.set.body.title', { args: { title: value } }));
          break;
        case 'description':
          body.push(this.i18nService.t('bingo.tile.activity.set.body.description', { args: { description: value } }));
          break;
        case 'value':
          body.push(this.i18nService.t('bingo.tile.activity.set.body.value', { args: { value: value } }));
          break;
        case 'free':
          body.push(
            this.i18nService.t(`bingo.tile.activity.set.body.free.${value as 'true' | 'false'}`, {
              args: { free: value },
            }),
          );
          break;
        case 'completionMode':
          body.push(
            this.i18nService.t('bingo.tile.activity.set.body.completionMode', { args: { completionMode: value } }),
          );
          break;
        case 'media':
          if (value !== null) {
            body.push(this.i18nService.t('bingo.tile.activity.set.body.mediaAdded', { args: { media: value } }));
          } else {
            body.push(this.i18nService.t('bingo.tile.activity.set.body.mediaRemoved'));
          }
          break;
        case 'items':
          body.push(this.i18nService.t('bingo.tile.activity.set.body.items'));
          break;
        default:
          break;
      }
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title, body);
  }

  private formatBingoTileDeletedActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? this.i18nService.t('general.system');
    const title = this.i18nService.t('bingo.tile.activity.deleted.title', {
      args: { username: requesterName, x: activity.parameters?.x, y: activity.parameters?.y },
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title);
  }

  private formatBingoTileMovedActivity(activity: Activity): ActivityDto {
    const requester = activity.createdById ? this.usersMap.get(activity.createdById) : null;
    const requesterName = requester?.username ?? this.i18nService.t('general.system');
    const key = activity.parameters?.swapped ? 'swapped' : 'moved';
    const title = this.i18nService.t(`bingo.tile.activity.${key}.title`, {
      args: {
        username: requesterName,
        x: activity.parameters?.x,
        y: activity.parameters?.y,
        toX: activity.parameters?.toX,
        toY: activity.parameters?.toY,
      },
    });

    return new ActivityDto(requester ?? null, activity.createdAt, activity.key, title);
  }

  private async preloadUsers(activities: Activity[]): Promise<void> {
    const userIds = activities
      .map((activity) => [activity.createdById, activity.parameters?.userId])
      .flat()
      .filter(Boolean) as number[];

    const users = await this.userRepository.find({ where: { id: In(userIds) } });

    users.forEach((user) => {
      this.usersMap.set(user.id, new UserDto(user));
    });
  }
}
