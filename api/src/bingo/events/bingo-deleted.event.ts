import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoDeletedParams = {
  bingoId: number;
  requesterId: number;
};

export class BingoDeletedEvent {
  public readonly bingoId: number;
  public readonly requesterId: number;

  constructor({ bingoId, requesterId }: BingoDeletedParams) {
    this.bingoId = bingoId;
    this.requesterId = requesterId;
  }
}

@EventsHandler(BingoDeletedEvent)
export class BingoDeletedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoDeletedEvent) {
    const { bingoId, requesterId } = event;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.deleted',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo',
      }),
    );
  }
}
