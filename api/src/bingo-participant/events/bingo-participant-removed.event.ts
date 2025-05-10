import { CreateActivityCommand } from '@/activity/commands/create-activity.command';
import { CommandBus, EventsHandler } from '@nestjs/cqrs';

export type BingoParticipantRemovedParams = {
  requesterId: number;
  bingoId: number;
  userId: number;
  role: string;
};

export class BingoParticipantRemovedEvent {
  constructor(public readonly params: BingoParticipantRemovedParams) {}
}

@EventsHandler(BingoParticipantRemovedEvent)
export class BingoParticipantRemovedHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: BingoParticipantRemovedEvent) {
    const { requesterId, bingoId, ...parameters } = event.params;

    await this.commandBus.execute(
      new CreateActivityCommand({
        key: 'bingo.participant.removed',
        requesterId,
        trackableId: bingoId,
        trackableType: 'Bingo',
        parameters,
      }),
    );
  }
}
