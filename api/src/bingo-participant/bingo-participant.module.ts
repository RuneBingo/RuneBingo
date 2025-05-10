import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BingoParticipant } from './bingo-participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BingoParticipant])],
})
export class BingoParticipantModule {}
