import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisModule } from '@/redis/redis.module';

import { CreateSessionForUserHandler } from './commands/create-session-for-user.handler';
import { SignOutSessionByUuidHandler } from './commands/sign-out-session-by-uuid.handler';
import { SessionCreatedHandler } from './events/session-created.handler';
import { SessionSignedOutHandler } from './events/session-signed-out.handler';
import { SessionMiddleware } from './middlewares/session.middleware';
import { Session } from './session.entity';

@Module({
  imports: [RedisModule, TypeOrmModule.forFeature([Session])],
  providers: [
    // Commands
    CreateSessionForUserHandler,
    SignOutSessionByUuidHandler,
    // Events
    SessionCreatedHandler,
    SessionSignedOutHandler,
  ],
})
export class SessionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
