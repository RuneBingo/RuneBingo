import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Activity } from '@/activity/activity.entity';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { AddBingoParticipantHandler } from '@/bingo/participant/commands/add-bingo-participant.command';
import { RemoveBingoParticipantHandler } from '@/bingo/participant/commands/remove-bingo-participant.command';
import { UpdateBingoParticipantHandler } from '@/bingo/participant/commands/update-bingo-participant.command';
import { SearchBingoParticipantsHandler } from '@/bingo/participant/queries/search-bingo-participants.query';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { User } from '@/user/user.entity';

import { BingoController } from './bingo.controller';
import { Bingo } from './bingo.entity';
import { CancelBingoHandler } from './commands/cancel-bingo.command';
import { CreateBingoHandler } from './commands/create-bingo.command';
import { DeleteBingoHandler } from './commands/delete-bingo.command';
import { EndBingoHandler } from './commands/end-bingo.command';
import { FormatBingoActivitiesHandler } from './commands/format-bingo-activities.command';
import { ResetBingoHandler } from './commands/reset-bingo.command';
import { StartBingoHandler } from './commands/start-bingo.command';
import { UpdateBingoHandler } from './commands/update-bingo.command';
import { BingoCanceledHandler } from './events/bingo-canceled.event';
import { BingoCreatedHandler } from './events/bingo-created.event';
import { BingoDeletedHandler } from './events/bingo-deleted.event';
import { BingoEndedHandler } from './events/bingo-ended.event';
import { BingoResetHandler } from './events/bingo-reset.event';
import { BingoStartedHandler } from './events/bingo-started.event';
import { BingoUpdatedHandler } from './events/bingo-updated.event';
import { FindBingoByBingoIdHandler } from './queries/find-bingo-by-bingo-id.query';
import { SearchBingoActivitiesHandler } from './queries/search-bingo-activities.query';
import { SearchBingosHandler } from './queries/search-bingos.query';
import { BingoTile } from './tile/bingo-tile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bingo, User, Activity, BingoParticipant, BingoTeam, BingoTile])],
  controllers: [BingoController],
  providers: [
    // Commands
    AddBingoParticipantHandler,
    CancelBingoHandler,
    CreateBingoHandler,
    DeleteBingoHandler,
    EndBingoHandler,
    FormatBingoActivitiesHandler,
    RemoveBingoParticipantHandler,
    ResetBingoHandler,
    StartBingoHandler,
    UpdateBingoHandler,
    UpdateBingoParticipantHandler,

    // Queries
    FindBingoByBingoIdHandler,
    SearchBingoActivitiesHandler,
    SearchBingoParticipantsHandler,
    SearchBingosHandler,

    // Events
    BingoCanceledHandler,
    BingoCreatedHandler,
    BingoDeletedHandler,
    BingoEndedHandler,
    BingoResetHandler,
    BingoStartedHandler,
    BingoUpdatedHandler,
  ],
})
export class BingoModule {}
