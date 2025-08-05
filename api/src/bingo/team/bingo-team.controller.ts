import { Controller, Get, Param, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { BingoTeamDto } from './dto/bingo-team.dto';
import { SearchBingoTeamsQuery } from './queries/search-bingo-teams.query';

@Controller('v1/bingo/:bingoId/team')
export class BingoTeamController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':bingoId/team')
  @ApiOperation({ summary: 'Find all teams for a bingo' })
  @ApiOkResponse({ description: 'The teams have been found.', type: [BingoTeamDto] })
  @ApiNotFoundResponse({ description: 'The bingo does not exist.' })
  async findTeamsByBingoId(@Req() req: Request, @Param('bingoId') bingoId: string): Promise<BingoTeamDto[]> {
    const requester = req.userEntity!;

    const teams = await this.queryBus.execute(new SearchBingoTeamsQuery({ requester, bingoId }));

    return Promise.all(teams.map((team) => BingoTeamDto.fromBingoTeam(team)));
  }
}
