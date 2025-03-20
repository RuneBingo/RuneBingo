import { randomBytes } from 'crypto';

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { I18nTranslations } from '@/i18n/types';
import { RedisService } from '@/redis/redis.service';
import { User } from '@/user/user.entity';

import { SignInWithEmailCommand, type SignInWithEmailResult } from './sign-in-with-email.command';
import type { SignInCodePayload } from '../auth-codes.types';

@CommandHandler(SignInWithEmailCommand)
export class SignInWithEmailHandler {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly redisService: RedisService,
  ) {}

  async execute(command: SignInWithEmailCommand): Promise<SignInWithEmailResult> {
    const { email } = command;

    const emailNormalized = User.normalizeEmail(email);
    const user = await this.userRepository.findOneBy({ emailNormalized });
    if (!user) {
      throw new NotFoundException(this.i18nService.t('auth.signInWithEmail.userNotFound'));
    }

    if (user.isDisabled) {
      throw new ForbiddenException(this.i18nService.t('auth.signInWithEmail.userDisabled'));
    }

    const code = randomBytes(3).toString('hex');
    const value: SignInCodePayload = { action: 'sign-in' };

    await this.redisService.set(`auth:${emailNormalized}:${code}`, JSON.stringify(value), (30).minutes);

    return { code };
  }
}
