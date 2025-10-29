import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bingo } from '../bingo.entity';
import { BingoTeamController } from './bingo-team.controller';
import { BingoTeam } from './bingo-team.entity';
import { SearchBingoTeamsHandler } from './queries/search-bingo-teams.query';

@Module({
  controllers: [BingoTeamController],
  imports: [TypeOrmModule.forFeature([Bingo, BingoTeam]), CqrsModule],
  providers: [SearchBingoTeamsHandler],
})
export class BingoTeamModule {}
