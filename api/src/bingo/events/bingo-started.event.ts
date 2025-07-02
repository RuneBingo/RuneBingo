import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoStartedParams = {
  bingoId: number;
  requesterId: number;
  early?: boolean;
  endDate?: string;
};

export class BingoStartedEvent {
  constructor(public readonly params: BingoStartedParams) {}
}

@EventsHandler(BingoStartedEvent)
export class BingoStartedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoStartedEvent) {
    const { bingoId, requesterId, early = false, endDate } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.started',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo',
        parameters: {
          early,
          ...(endDate ? { endDate } : {}),
        },
      }),
    );
  }
}
