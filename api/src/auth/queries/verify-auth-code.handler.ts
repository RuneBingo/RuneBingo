import { BadRequestException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { I18nService } from 'nestjs-i18n';

import { I18nTranslations } from '@/i18n/types';
import { RedisService } from '@/redis/redis.service';
import { User } from '@/user/user.entity';

import { VerifyAuthCodeQuery, type VerifyAuthCodeResult } from './verify-auth-code.query';
import type { AuthCodePayload } from '../auth-codes.types';

@QueryHandler(VerifyAuthCodeQuery)
export class VerifyAuthCodeHandler {
  constructor(
    private readonly i18nService: I18nService<I18nTranslations>,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: VerifyAuthCodeQuery): Promise<VerifyAuthCodeResult> {
    const { email, code } = query;
    const emailNormalized = User.normalizeEmail(email);

    const payload = await this.redisService.get(`auth:${emailNormalized}:${code}`);
    if (!payload) {
      throw new BadRequestException(this.i18nService.t('auth.verifyAuthCode.invalidOrExpired'));
    }

    const payloadObj = JSON.parse(payload) as object;
    if (!('action' in payloadObj)) {
      throw new BadRequestException(this.i18nService.t('auth.verifyAuthCode.invalidOrExpired'));
    }

    await this.redisService.delete(`auth:${emailNormalized}:${code}`);

    return payloadObj as AuthCodePayload;
  }
}
