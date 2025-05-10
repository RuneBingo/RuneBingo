import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Activity } from '@/activity/activity.entity';
import { BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { User } from '@/user/user.entity';

import { BingoController } from './bingo.controller';
import { Bingo } from './bingo.entity';
import { CancelBingoHandler } from './commands/cancel-bingo.command';
import { CreateBingoHandler } from './commands/create-bingo.command';
import { DeleteBingoHandler } from './commands/delete-bingo.command';
import { FormatBingoActivitiesHandler } from './commands/format-bingo-activities.command';
import { UpdateBingoHandler } from './commands/update-bingo.command';
import { BingoCanceledHandler } from './events/bingo-canceled.event';
import { BingoCreatedHandler } from './events/bingo-created.event';
import { BingoDeletedHandler } from './events/bingo-deleted.event';
import { BingoUpdatedHandler } from './events/bingo-updated.event';
import { FindBingoBySlugHandler } from './queries/find-bingo-by-slug.query';
import { SearchBingoActivitiesHandler } from './queries/search-bingo-activities.query';
import { SearchBingosHandler } from './queries/search-bingos.query';
import { SearchBingoParticipantsHandler } from '@/bingo-participant/queries/search-bingo-participants.query';
import { AddBingoParticipantHandler } from '@/bingo-participant/commands/add-bingo-participant.command';
import { RemoveBingoParticipantHandler } from '@/bingo-participant/commands/remove-bingo-participant.command';
import { UpdateBingoParticipantHandler } from '@/bingo-participant/commands/update-bingo-participant.command';
import { BingoTeam } from '@/bingo-team/bingo-team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bingo, User, Activity, BingoParticipant, BingoTeam])],
  controllers: [BingoController],
  providers: [
    //Commands
    CreateBingoHandler,
    UpdateBingoHandler,
    DeleteBingoHandler,
    FormatBingoActivitiesHandler,
    AddBingoParticipantHandler,
    RemoveBingoParticipantHandler,
    UpdateBingoParticipantHandler,
    CancelBingoHandler,

    //Queries
    FindBingoBySlugHandler,
    SearchBingosHandler,
    SearchBingoActivitiesHandler,
    SearchBingoParticipantsHandler,

    //Events
    BingoCreatedHandler,
    BingoUpdatedHandler,
    BingoDeletedHandler,
    BingoCanceledHandler,
  ],
})
export class BingoModule {}
