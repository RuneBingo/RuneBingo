import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BingoParticipant } from './bingo-participant.entity';
import { BingoParticipantAddedHandler } from './events/bingo-participant-added.event';
import { BingoParticipantRemovedHandler } from './events/bingo-participant-removed.event';
import { BingoParticipantUpdatedHandler } from './events/bingo-participant-updated.event';
import { GetUserBingoParticipationsHandler } from './queries/get-user-bingo-participations.query';
import { ListMyBingoParticipationsHandler } from './queries/list-my-bingo-participations.query';

@Module({
  imports: [TypeOrmModule.forFeature([BingoParticipant])],
  providers: [
    // Query handlers
    GetUserBingoParticipationsHandler,
    ListMyBingoParticipationsHandler,
    // Event handlers
    BingoParticipantAddedHandler,
    BingoParticipantRemovedHandler,
    BingoParticipantUpdatedHandler,
  ],
})
export class BingoParticipantModule {}
