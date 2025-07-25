import { Module } from '@nestjs/common';

import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BingoModule } from './bingo/bingo.module';
import { BingoParticipantModule } from './bingo/participant/bingo-participant.module';
import { BingoTeamModule } from './bingo/team/bingo-team.module';
import { BingoTileModule } from './bingo/tile/bingo-tile.module';
import { configModule } from './config';
import { cqrsModule } from './cqrs';
import { dbModule } from './db';
import { SeedingModule } from './db/seeding/seeding.module';
import { EmailerModule } from './emailer/emailer.module';
import { EmailerService } from './emailer/emailer.service';
import { i18nModule } from './i18n';
import { bullModule } from './jobs/bull';
import { JobsModule } from './jobs/jobs.module';
import { MediaModule } from './media/media.module';
import { OsrsModule } from './osrs/osrs.module';
import { RedisModule } from './redis/redis.module';
import { SessionModule } from './session/session.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    configModule,
    bullModule,
    cqrsModule,
    dbModule,
    i18nModule,
    RedisModule,
    SeedingModule,
    SessionModule,
    UserModule,
    AuthModule,
    RedisModule,
    ActivityModule,
    EmailerModule,
    JobsModule,
    BingoModule,
    BingoParticipantModule,
    BingoTeamModule,
    BingoTileModule,
    MediaModule,
    OsrsModule,
  ],
  providers: [EmailerService],
  controllers: [AppController],
})
export class AppModule {}
