import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoUpdatedParams = {
  bingoId: number;
  requesterId: number;
  updates: {
    language?: string;
    title?: string;
    description?: string;
    isPrivate?: boolean;
    width?: number;
    height?: number;
    fullLineValue?: number;
    startDate?: string;
    endDate?: string;
  };
};

export class BingoUpdatedEvent {
  public readonly bingoId: number;
  public readonly requesterId: number;
  public readonly updates: {
    language?: string;
    title?: string;
    description?: string;
    isPrivate?: boolean;
    width?: number;
    height?: number;
    fullLineValue?: number;
    startDate?: string;
    endDate?: string;
  };
  constructor({ bingoId, requesterId, updates }: BingoUpdatedParams) {
    this.bingoId = bingoId;
    this.requesterId = requesterId;
    this.updates = updates;
  }
}

@EventsHandler(BingoUpdatedEvent)
export class BingoUpdatedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoUpdatedEvent) {
    const { bingoId, requesterId, updates } = event;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.updated',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo',
        parameters: updates,
      }),
    );
  }
}
