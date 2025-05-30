import { Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { ShortBingoDto } from '@/bingo/dto/short-bingo.dto';
import { User } from '@/user/user.entity';

import { BingoParticipant } from '../bingo-participant.entity';

export type ListMyBingoParticipationsParams = {
  requester: User;
  search: string | undefined;
};

export type ListMyBingoParticipationsResult = ShortBingoDto[];

export class ListMyBingoParticipationsQuery extends Query<ListMyBingoParticipationsResult> {
  constructor(public readonly params: ListMyBingoParticipationsParams) {
    super();
  }
}

@QueryHandler(ListMyBingoParticipationsQuery)
export class ListMyBingoParticipationsHandler {
  constructor(
    @InjectRepository(BingoParticipant)
    private readonly bingoParticipantRepository: Repository<BingoParticipant>,
  ) {}

  async execute(query: ListMyBingoParticipationsQuery): Promise<ListMyBingoParticipationsResult> {
    const { requester, search } = query.params;

    const bingoParticipants = await this.bingoParticipantRepository.find({
      where: {
        userId: requester.id,
        bingo: {
          title: search ? ILike(`%${search}%`) : undefined,
        },
      },
      relations: ['bingo'],
    });

    return Promise.all(
      bingoParticipants.map(async (bingoParticipant) => {
        const bingo = await bingoParticipant.bingo;

        const dto = new ShortBingoDto();
        dto.id = bingo.bingoId;
        dto.title = bingo.title;
        dto.status = bingo.status;
        dto.role = bingoParticipant.role;

        return dto;
      }),
    );
  }
}
