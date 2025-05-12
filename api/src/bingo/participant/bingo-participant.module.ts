import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BingoParticipant } from './bingo-participant.entity';
import { BingoParticipantAddedHandler } from './events/bingo-participant-added.event';
import { BingoParticipantRemovedHandler } from './events/bingo-participant-removed.event';
import { BingoParticipantUpdatedHandler } from './events/bingo-participant-updated.event';

@Module({
  imports: [TypeOrmModule.forFeature([BingoParticipant])],
  providers: [BingoParticipantAddedHandler, BingoParticipantRemovedHandler, BingoParticipantUpdatedHandler],
})
export class BingoParticipantModule {}
