import { CommandBus, EventsHandler } from '@nestjs/cqrs';

import { CreateActivityCommand } from '@/activity/commands/create-activity.command';

export type BingoResetParams = {
  bingoId: number;
  requesterId: number;
  startDate: string;
  endDate: string;
  maxRegistrationDate: string;
  deletedTiles: boolean;
  deletedTeams: boolean;
  deletedParticipants: boolean;
};

export class BingoResetEvent {
  constructor(public readonly params: BingoResetParams) {}
}

@EventsHandler(BingoResetEvent)
export class BingoResetHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoResetEvent) {
    const {
      bingoId,
      requesterId,
      startDate,
      endDate,
      maxRegistrationDate,
      deletedTiles,
      deletedTeams,
      deletedParticipants,
    } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.reset',
        requesterId,
        trackableType: 'bingo',
        trackableId: bingoId,
        parameters: {
          startDate,
          endDate,
          maxRegistrationDate,
          deletedTiles,
          deletedTeams,
          deletedParticipants,
        },
      }),
    );
  }
}
