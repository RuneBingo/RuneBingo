import { BadRequestException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import Joi from 'joi';
import { I18nService } from 'nestjs-i18n';

import { I18nTranslations } from '@/i18n/types';
import { RedisService } from '@/redis/redis.service';
import { User } from '@/user/user.entity';

import { VerifyAuthCodeQuery, type VerifyAuthCodeResult } from './verify-auth-code.query';
import { signInCodeSchema, signUpCodeSchema } from '../auth-codes.schemas';
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

    this.validatePayload(payloadObj);

    await this.redisService.delete(`auth:${emailNormalized}:${code}`);

    return payloadObj;
  }

  private validatePayload(payload: object): asserts payload is AuthCodePayload {
    if (!('action' in payload)) {
      throw new BadRequestException(this.i18nService.t('auth.verifyAuthCode.invalidOrExpired'));
    }

    let schema: Joi.ObjectSchema<AuthCodePayload>;
    switch (payload.action) {
      case 'sign-in':
        schema = signInCodeSchema;
        break;
      case 'sign-up':
        schema = signUpCodeSchema;
        break;
      default:
        throw new BadRequestException(this.i18nService.t('auth.verifyAuthCode.invalidOrExpired'));
    }

    const { error } = schema.validate(payload);
    if (error) {
      throw new BadRequestException(this.i18nService.t('auth.verifyAuthCode.invalidOrExpired'));
    }
  }
}
