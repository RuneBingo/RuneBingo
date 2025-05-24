import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BingoParticipant } from './bingo-participant.entity';
import { GetUserBingoParticipationsHandler } from './queries/get-user-bingo-participations.query';
import { ListMyBingoParticipationsHandler } from './queries/list-my-bingo-participations.query';
@Module({
  imports: [TypeOrmModule.forFeature([BingoParticipant])],
  providers: [GetUserBingoParticipationsHandler, ListMyBingoParticipationsHandler],
})
export class BingoParticipantModule {}
