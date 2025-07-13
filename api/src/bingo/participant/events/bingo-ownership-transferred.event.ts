import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoOwnershipTransferredParams = {
  requesterId: number;
  bingoId: number;
  userId: number;
};

export class BingoOwnershipTransferredEvent {
  constructor(public readonly params: BingoOwnershipTransferredParams) {}
}

@EventsHandler(BingoOwnershipTransferredEvent)
export class BingoOwnershipTransferredHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoOwnershipTransferredEvent) {
    const { requesterId, bingoId, userId } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.participant.ownershipTransferred',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo',
        parameters: { userId },
      }),
    );
  }
}
