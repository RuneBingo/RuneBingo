import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoTileDeletedParams = {
  requesterId: number | null;
  bingoId: number;
  x: number;
  y: number;
};

export class BingoTileDeletedEvent {
  constructor(public readonly params: BingoTileDeletedParams) {}
}

@EventsHandler(BingoTileDeletedEvent)
export class BingoTileDeletedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoTileDeletedEvent) {
    const { requesterId, bingoId, x, y } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.tile.deleted',
        requesterId,
        trackableType: 'Bingo',
        trackableId: bingoId,
        parameters: { x, y },
      }),
    );
  }
}
