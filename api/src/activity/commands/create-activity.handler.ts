import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateActivityCommand, type CreateActivityResult } from './create-activity.command';
import { Activity } from '../activity.entity';

@CommandHandler(CreateActivityCommand)
export class CreateActivityHandler {
  constructor(@InjectRepository(Activity) private readonly activityRepository: Repository<Activity>) {}

  async execute(command: CreateActivityCommand): Promise<CreateActivityResult> {
    const { key, requesterId, trackableType, trackableId, parameters } = command;

    const activity = new Activity();
    activity.key = key;
    activity.trackableType = trackableType;
    activity.trackableId = trackableId;
    activity.parameters = parameters;
    activity.createdById = requesterId;

    return this.activityRepository.save(activity);
  }
}
