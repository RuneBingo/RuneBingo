import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailerModule } from '@/emailer/emailer.module';
import { RedisModule } from '@/redis/redis.module';
import { User } from '@/user/user.entity';

import { AuthController } from './auth.controller';
import { SignInWithEmailHandler } from './commands/sign-in-with-email.handler';
import { SignUpWithEmailHandler } from './commands/sign-up-with-email.handler';
import { VerifyAuthCodeHandler } from './queries/verify-auth-code.handler';

@Module({
  imports: [RedisModule, EmailerModule, TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [
    // Commands
    SignInWithEmailHandler,
    SignUpWithEmailHandler,
    VerifyAuthCodeHandler,
  ],
})
export class AuthModule {}
