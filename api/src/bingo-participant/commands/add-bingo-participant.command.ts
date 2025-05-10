import { Command } from '@nestjs/cqrs';

import { type Bingo } from '@/bingo/bingo.entity';
import { type User } from '@/user/user.entity';

import { type BingoParticipant } from '../bingo-participant.entity';
import { type BingoRoles } from '../roles/bingo-roles.constants';

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
