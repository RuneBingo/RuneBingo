import { Command } from '@nestjs/cqrs';

import { type Activity } from '@/activity/activity.entity';
import { type ActivityDto } from '@/activity/dto/activity.dto';

export type FormatUserActivitiesResult = ActivityDto[];

export class FormatUserActivitiesCommand extends Command<FormatUserActivitiesResult> {
  constructor(public readonly activities: Activity[]) {
    super();
  }
}
