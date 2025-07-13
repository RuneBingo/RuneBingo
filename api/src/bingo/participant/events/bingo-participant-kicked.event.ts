import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoParticipantKickedParams = {
  requesterId: number;
  bingoId: number;
  userId: number;
  deletedTileCompletions: boolean;
};

export class BingoParticipantKickedEvent {
  constructor(public readonly params: BingoParticipantKickedParams) {}
}

@EventsHandler(BingoParticipantKickedEvent)
export class BingoParticipantKickedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoParticipantKickedEvent) {
    const { requesterId, bingoId, userId, deletedTileCompletions } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.participant.kicked',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo',
        parameters: { userId, deletedTileCompletions },
      }),
    );
  }
}
