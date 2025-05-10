import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Activity } from '@/activity/activity.entity';
import { BingoParticipant } from '@/bingo-participant/bingo-participant.entity';
import { AddBingoParticipantHandler } from '@/bingo-participant/commands/add-bingo-participant.handler';
import { GetBingoParticipantsHandler } from '@/bingo-participant/queries/get-bingo-participants.handler';
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

@Module({
  imports: [TypeOrmModule.forFeature([Bingo, User, Activity, BingoParticipant])],
  controllers: [BingoController],
  providers: [
    //Commands
    CreateBingoHandler,
    UpdateBingoHandler,
    DeleteBingoHandler,
    FormatBingoActivitiesHandler,
    AddBingoParticipantHandler,
    CancelBingoHandler,

    //Queries
    FindBingoBySlugHandler,
    SearchBingosHandler,
    SearchBingoActivitiesHandler,
    GetBingoParticipantsHandler,

    //Events
    BingoCreatedHandler,
    BingoUpdatedHandler,
    BingoDeletedHandler,
    BingoCanceledHandler,
  ],
})
export class BingoModule {}
