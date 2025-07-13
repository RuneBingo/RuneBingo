import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BingoParticipantController } from './bingo-participant.controller';
import { BingoParticipant } from './bingo-participant.entity';
import { Bingo } from '../bingo.entity';
import { KickBingoParticipantHandler } from './commands/kick-bingo-participant.command';
import { LeaveBingoHandler } from './commands/leave-bingo.command';
import { TransferBingoOwnershipHandler } from './commands/transfer-bingo-ownership.command';
import { UpdateBingoParticipantHandler } from './commands/update-bingo-participant.command';
import { BingoOwnershipTransferredHandler } from './events/bingo-ownership-transferred.event';
import { BingoParticipantKickedHandler } from './events/bingo-participant-kicked.event';
import { BingoParticipantUpdatedHandler } from './events/bingo-participant-updated.event';
import { GetUserBingoParticipationsHandler } from './queries/get-user-bingo-participations.query';
import { ListMyBingoParticipationsHandler } from './queries/list-my-bingo-participations.query';
import { BingoTeam } from '../team/bingo-team.entity';
import { BingoParticipantLeftHandler } from './events/bingo-participant-left.event';

@Module({
  imports: [TypeOrmModule.forFeature([Bingo, BingoTeam, BingoParticipant])],
  controllers: [BingoParticipantController],
  providers: [
    // Command handlers
    KickBingoParticipantHandler,
    LeaveBingoHandler,
    TransferBingoOwnershipHandler,
    UpdateBingoParticipantHandler,
    // Query handlers
    GetUserBingoParticipationsHandler,
    ListMyBingoParticipationsHandler,
    // Event handlers
    BingoOwnershipTransferredHandler,
    BingoParticipantKickedHandler,
    BingoParticipantLeftHandler,
    BingoParticipantUpdatedHandler,
  ],
})
export class BingoParticipantModule {}
