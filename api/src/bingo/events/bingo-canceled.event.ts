import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoCanceledParams = {
  bingoId: number;
  requesterId: number;
};

export class BingoCanceledEvent {
  public readonly bingoId: number;
  public readonly requesterId: number;

  constructor({ bingoId, requesterId }: BingoCanceledParams) {
    this.bingoId = bingoId;
    this.requesterId = requesterId;
  }
}

@EventsHandler(BingoCanceledEvent)
export class BingoCanceledHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoCanceledEvent) {
    const { bingoId, requesterId } = event;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.canceled',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo',
      }),
    );
  }
}
