import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bingo } from '@/bingo/bingo.entity';
import { BingoParticipant } from '@/bingo/participant/bingo-participant.entity';
import { BingoTeam } from '@/bingo/team/bingo-team.entity';
import { User } from '@/user/user.entity';

import { BingoInvitationController } from './bingo-invitation.controller';
import { BingoInvitation } from './bingo-invitation.entity';
// Handlers
import { CancelBingoInvitationHandler } from './commands/cancel-bingo-invitation.handler';
import { CreateBingoInvitationHandler } from './commands/create-bingo-invitation.handler';
import { DisableBingoInvitationLinkHandler } from './commands/disable-bingo-invitation-link.handler';
import { UpdateBingoInvitationHandler } from './commands/update-bingo-invitation.handler';
import { SearchBingoInvitationsHandler } from './queries/search-bingo-invitations.handler';

@Module({
  imports: [TypeOrmModule.forFeature([BingoInvitation, Bingo, BingoParticipant, BingoTeam, User])],
  controllers: [BingoInvitationController],
  providers: [
    // Commands
    CreateBingoInvitationHandler,
    CancelBingoInvitationHandler,
    DisableBingoInvitationLinkHandler,
    UpdateBingoInvitationHandler,

    // Queries
    SearchBingoInvitationsHandler,
  ],
})
export class BingoInvitationModule {}
