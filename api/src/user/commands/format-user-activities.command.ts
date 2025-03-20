import { Command } from '@nestjs/cqrs';

import { type Activity } from '@/activity/activity.entity';

import { type ActivityDto } from '../../activity/dto/activity.dto';
import { type UserDto } from '../dto/user.dto';

export type FormatUserActivitiesResult = ActivityDto<UserDto>[];

export class FormatUserActivitiesCommand extends Command<FormatUserActivitiesResult> {
  constructor(public readonly activities: Activity[]) {
    super();
  }
}
