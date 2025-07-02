import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoTileMovedParams = {
  requesterId: number | null;
  bingoId: number;
  x: number;
  y: number;
  toX: number;
  toY: number;
  swapped: boolean;
};

export class BingoTileMovedEvent {
  constructor(public readonly params: BingoTileMovedParams) {}
}

@EventsHandler(BingoTileMovedEvent)
export class BingoTileMovedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoTileMovedEvent) {
    const { requesterId, bingoId, x, y, toX, toY, swapped } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.tile.moved',
        requesterId,
        trackableType: 'Bingo',
        trackableId: bingoId,
        parameters: { x, y, toX, toY, swapped },
      }),
    );
  }
}
