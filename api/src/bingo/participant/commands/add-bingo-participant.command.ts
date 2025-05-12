import { Bingo } from '@/bingo/bingo.entity';
import { User } from '@/user/user.entity';
import { Command, CommandHandler, EventBus } from '@nestjs/cqrs';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BingoParticipant } from '../bingo-participant.entity';
import { BingoRoles } from '../roles/bingo-roles.constants';
import { BingoParticipantAddedEvent } from '../events/bingo-participant-added.event';

export type AddBingoParticipantParams = {
  requester: User | null;
  bingo: Bingo;
  user: User;
  role: BingoRoles;
};

export type AddBingoParticipantResult = BingoParticipant;

export class AddBingoParticipantCommand extends Command<BingoParticipant> {
  constructor(public readonly params: AddBingoParticipantParams) {
    super();
  }
}

@CommandHandler(AddBingoParticipantCommand)
export class AddBingoParticipantHandler {
  constructor(
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddBingoParticipantCommand): Promise<AddBingoParticipantResult> {
    const { requester, bingo, user, role } = command.params;

    const bingoParticipant = new BingoParticipant();
    bingoParticipant.userId = user.id;
    bingoParticipant.bingoId = bingo.id;
    bingoParticipant.role = role;

    this.eventBus.publish(
      new BingoParticipantAddedEvent({
        bingoId: bingo.id,
        requesterId: requester ? requester.id : null,
        userId: user.id,
        role: role,
      }),
    );

    return await this.bingoParticipantRepository.save(bingoParticipant);
  }
}
