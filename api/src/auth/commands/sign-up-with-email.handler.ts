import { randomBytes } from 'crypto';

import { ConflictException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { I18nTranslations } from '@/i18n/types';
import { RedisService } from '@/redis/redis.service';
import { User } from '@/user/user.entity';

import { SignUpWithEmailCommand, type SignUpWithEmailResult } from './sign-up-with-email.command';
import { SignUpCodePayload } from '../auth-codes.types';

@CommandHandler(SignUpWithEmailCommand)
export class SignUpWithEmailHandler {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly redisService: RedisService,
  ) {}

  async execute(command: SignUpWithEmailCommand): Promise<SignUpWithEmailResult> {
    const { email, username, language } = command;

    const emailNormalized = User.normalizeEmail(email);
    const usernameNormalized = User.normalizeUsername(username);

    const userByEmail = await this.userRepository.findOneBy({ emailNormalized });
    if (userByEmail) {
      throw new ConflictException(this.i18nService.t('auth.signUpWithEmail.emailAlreadyExists'));
    }

    const userByUsername = await this.userRepository.findOneBy({ usernameNormalized });
    if (userByUsername) {
      throw new ConflictException(this.i18nService.t('auth.signUpWithEmail.usernameAlreadyExists'));
    }

    const code = randomBytes(3).toString('hex');
    const value: SignUpCodePayload = { action: 'sign-up', username, language };

    await this.redisService.set(`auth:${emailNormalized}:${code}`, JSON.stringify(value), (30).minutes);

    return { code };
  }
}
