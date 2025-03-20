import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

import { UserUpdatedEvent } from './user-updated.event';

@EventsHandler(UserUpdatedEvent)
export class UserUpdatedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: UserUpdatedEvent) {
    const { userId, requesterId, updates } = event;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'user.updated',
        requesterId,
        trackableId: userId,
        trackableType: 'User',
        parameters: updates,
      }),
    );
  }
}
