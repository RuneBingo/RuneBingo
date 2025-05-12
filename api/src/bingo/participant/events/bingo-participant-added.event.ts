import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoParticipantAddedParams = {
  requesterId: number | null;
  bingoId: number;
  userId: number;
  role: string;
};

export class BingoParticipantAddedEvent {
  constructor(public readonly params: BingoParticipantAddedParams) {}
}

@EventsHandler(BingoParticipantAddedEvent)
export class BingoParticipantAddedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoParticipantAddedEvent) {
    const { requesterId, bingoId, ...parameters } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.participant.added',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo',
        parameters,
      }),
    );
  }
}
