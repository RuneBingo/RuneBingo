import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BingoParticipantController } from './bingo-participant.controller';
import { BingoParticipant } from './bingo-participant.entity';
import { Bingo } from '../bingo.entity';
import { UpdateBingoParticipantHandler } from './commands/update-bingo-participant.command';
import { BingoParticipantAddedHandler } from './events/bingo-participant-added.event';
import { BingoParticipantRemovedHandler } from './events/bingo-participant-removed.event';
import { BingoParticipantUpdatedHandler } from './events/bingo-participant-updated.event';
import { GetUserBingoParticipationsHandler } from './queries/get-user-bingo-participations.query';
import { ListMyBingoParticipationsHandler } from './queries/list-my-bingo-participations.query';
import { BingoTeam } from '../team/bingo-team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bingo, BingoTeam, BingoParticipant])],
  controllers: [BingoParticipantController],
  providers: [
    // Command handlers
    UpdateBingoParticipantHandler,
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
