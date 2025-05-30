import { Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bingo } from '@/bingo/bingo.entity';

import { BingoParticipant } from '../bingo-participant.entity';

export type GetUserBingoParticipationsParams = {
  userId: number;
  bingoId: number | null;
};

export type GetUserBingoParticipationsResult = {
  hasBingos: boolean;
  currentBingo: Bingo | null;
  currentBingoParticipant: BingoParticipant | null;
};

export class GetUserBingoParticipationsQuery extends Query<GetUserBingoParticipationsResult> {
  constructor(public readonly params: GetUserBingoParticipationsParams) {
    super();
  }
}

@QueryHandler(GetUserBingoParticipationsQuery)
export class GetUserBingoParticipationsHandler {
  constructor(
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
  ) {}

  async execute(query: GetUserBingoParticipationsQuery): Promise<GetUserBingoParticipationsResult> {
    const { userId, bingoId } = query.params;

    const hasBingos = await this.bingoParticipantRepository
      .createQueryBuilder('participant')
      .innerJoin('participant.bingo', 'bingo', 'bingo.deletedAt IS NULL')
      .where('participant.userId = :userId', { userId })
      .getExists();

    let currentBingo: Bingo | null = null;
    let currentBingoParticipant: BingoParticipant | null = null;

    if (bingoId) {
      currentBingoParticipant = await this.bingoParticipantRepository.findOne({
        where: {
          userId,
          bingoId,
        },
        relations: ['bingo'],
      });

      if (currentBingoParticipant) {
        currentBingo = await currentBingoParticipant.bingo;
      }
    }

    return {
      hasBingos,
      currentBingo,
      currentBingoParticipant,
    };
  }
}
