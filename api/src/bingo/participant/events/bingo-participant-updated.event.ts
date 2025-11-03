import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoParticipantUpdatedParams = {
  requesterId: number;
  bingoId: number;
  userId: number;
  updates: {
    role?: string;
    teamName?: string | null;
  };
};

export class BingoParticipantUpdatedEvent {
  constructor(public readonly params: BingoParticipantUpdatedParams) {}
}

@EventsHandler(BingoParticipantUpdatedEvent)
export class BingoParticipantUpdatedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoParticipantUpdatedEvent) {
    const { requesterId, bingoId, userId, updates } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.participant.updated',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo',
        parameters: { userId, updates },
      }),
    );
  }
}
