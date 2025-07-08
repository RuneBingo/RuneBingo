import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoEndedParams = {
  bingoId: number;
  requesterId: number;
  early?: boolean;
};

export class BingoEndedEvent {
  constructor(public readonly params: BingoEndedParams) {}
}

@EventsHandler(BingoEndedEvent)
export class BingoEndedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoEndedEvent) {
    const { bingoId, requesterId, early = false } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.ended',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo',
        parameters: { early },
      }),
    );
  }
}
