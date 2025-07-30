import { Query, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bingo } from '../../bingo.entity';
import { BingoTeam } from '../bingo-team.entity';

export class SearchBingoTeamsQuery extends Query<BingoTeam[]> {
  constructor(public readonly bingoId: string) {
    super();
  }
}

@QueryHandler(SearchBingoTeamsQuery)
export class SearchBingoTeamsHandler implements IQueryHandler<SearchBingoTeamsQuery> {
  constructor(
    @InjectRepository(Bingo)
    private readonly bingoRepository: Repository<Bingo>,
  ) {}

  async execute(query: SearchBingoTeamsQuery): Promise<BingoTeam[]> {
    const bingo = await this.bingoRepository.findOne({
      where: { bingoId: query.bingoId },
      relations: ['teams', 'teams.captain'],
    });
    return bingo?.teams || [];
  }
}
