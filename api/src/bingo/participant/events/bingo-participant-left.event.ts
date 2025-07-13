import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoParticipantLeftParams = {
  requesterId: number;
  bingoId: number;
};

export class BingoParticipantLeftEvent {
  constructor(public readonly params: BingoParticipantLeftParams) {}
}

@EventsHandler(BingoParticipantLeftEvent)
export class BingoParticipantLeftHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoParticipantLeftEvent) {
    const { requesterId, bingoId } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.participant.left',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo',
      }),
    );
  }
}
