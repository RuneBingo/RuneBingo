import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

import { BingoTileCompletionMode } from '../bingo-tile-completion-mode.enum';

export type BingoTileSetParams = {
  requesterId: number | null;
  bingoId: number;
  x: number;
  y: number;
  title?: string;
  description?: string;
  value?: number;
  free?: boolean;
  completionMode?: BingoTileCompletionMode;
  mediaId?: string | null;
  items?: { itemId: number; quantity: number }[];
};

export class BingoTileSetEvent {
  constructor(public readonly params: BingoTileSetParams) {}
}

@EventsHandler(BingoTileSetEvent)
export class BingoTileSetHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoTileSetEvent) {
    const { requesterId, bingoId, ...parameters } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.tile.set',
        requesterId,
        trackableType: 'Bingo',
        trackableId: bingoId,
        parameters,
      }),
    );
  }
}
