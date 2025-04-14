import { Bingo } from '@/bingo/bingo.entity';
import { User } from '@/user/user.entity';
import { Command, CommandHandler } from '@nestjs/cqrs';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BingoParticipant } from '../bingo-participant.entity';
import { BingoRoles } from '../roles/bingo-roles.constants';

export type AddBingoParticipantParams = {
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
  ) {}

  async execute(command: AddBingoParticipantCommand): Promise<AddBingoParticipantResult> {
    const { bingo, user, role } = command.params;

    const bingoParticipant = new BingoParticipant();
    bingoParticipant.userId = user.id;
    bingoParticipant.bingoId = bingo.id;
    bingoParticipant.role = role;

    return this.bingoParticipantRepository.save(bingoParticipant);
  }
}
