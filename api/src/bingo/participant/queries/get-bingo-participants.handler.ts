import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetBingoParticipantsQuery, GetBingoParticipantsResult } from './get-bingo-participants.query';
import { BingoParticipant } from '../bingo-participant.entity';

@QueryHandler(GetBingoParticipantsQuery)
export class GetBingoParticipantsHandler {
  constructor(
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
  ) {}

  async execute(query: GetBingoParticipantsQuery): Promise<GetBingoParticipantsResult> {
    const bingoParticipants = this.bingoParticipantRepository.find({
      where: { bingoId: query.params.bingoId },
    });

    return bingoParticipants;
  }
}
