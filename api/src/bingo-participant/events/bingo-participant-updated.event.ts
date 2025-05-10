import { CreateActivityCommand } from '@/activity/commands/create-activity.command';
import { CommandBus, EventsHandler } from '@nestjs/cqrs';

export type BingoParticipantUpdatedParams = {
  requesterId: number;
  bingoId: number;
  username: string;
  updates: {
    role?: string;
    teamName?: string;
  }
};

export class BingoParticipantUpdatedEvent {
  constructor(public readonly params: BingoParticipantUpdatedParams) {}
}

@EventsHandler(BingoParticipantUpdatedEvent)
export class BingoParticipantUpdatedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoParticipantUpdatedEvent) {
    const { requesterId, bingoId, username, updates } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo_participant.updated',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo-Participant',
        parameters: {username, updates},
      }),
    );
  }
}
