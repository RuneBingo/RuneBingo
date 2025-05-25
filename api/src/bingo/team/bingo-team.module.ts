import { Module } from '@nestjs/common';

import { BingoTeamController } from './bingo-team.controller';

@Module({
  controllers: [BingoTeamController],
})
export class BingoTeamModule {}
