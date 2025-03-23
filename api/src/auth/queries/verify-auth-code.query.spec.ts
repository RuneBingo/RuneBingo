import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { RedisService } from '@/redis/redis.service';
import { User } from '@/user/user.entity';

import { VerifyAuthCodeHandler } from './verify-auth-code.handler';
import { VerifyAuthCodeQuery } from './verify-auth-code.query';
import { RedisServiceMock } from '../../../test/mocks/redis.service.mock';

describe('SignUpWithEmailHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let redisService: RedisServiceMock;
  let handler: VerifyAuthCodeHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([User])],
      providers: [
        SeedingService,
        VerifyAuthCodeHandler,
        {
          provide: RedisService,
          useValue: new RedisServiceMock(),
        },
      ],
    }).compile();

    handler = module.get<VerifyAuthCodeHandler>(VerifyAuthCodeHandler);
    redisService = module.get(RedisService);
    seedingService = module.get(SeedingService);
  });

  beforeEach(async () => {
    redisService.clear();
    await seedingService.initialize();
  });

  afterEach(async () => {
    await seedingService.clear();
  });

  afterAll(() => {
    return module.close();
  });

  it('throws BadRequestException if the code is not found', async () => {
    const query = new VerifyAuthCodeQuery('zezima@runebingo.com', '123456');

    await expect(handler.execute(query)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException if the code payload is invalid', async () => {
    const invalidGeneralPayload = JSON.stringify({ test: 'invalid' });
    const invalidSignInPayload = JSON.stringify({ action: 'sign-in', test: 'invalid' });
    const invalidSignUpPayload = JSON.stringify({ action: 'sign-up', username: [] });

    await redisService.set('auth:zezima@runebingo.com:general', invalidGeneralPayload);
    await redisService.set('auth:zezima@runebingo.com:signin', invalidSignInPayload);
    await redisService.set('auth:zezima@runebingo.com:signup', invalidSignUpPayload);

    const invalidGeneralQuery = new VerifyAuthCodeQuery('zezima@runebingo.com', 'general');
    const invalidSignInQuery = new VerifyAuthCodeQuery('zezima@runebingo.com', 'signin');
    const invalidSignUpQuery = new VerifyAuthCodeQuery('zezima@runebingo.com', 'signup');

    await expect(handler.execute(invalidGeneralQuery)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(invalidSignInQuery)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(invalidSignUpQuery)).rejects.toThrow(BadRequestException);
  });

  it('returns valid sign-in payload', async () => {
    const payload = { action: 'sign-in' };
    const query = new VerifyAuthCodeQuery('zezima@runebingo.com', 'signin');

    await redisService.set('auth:zezima@runebingo.com:signin', JSON.stringify(payload));

    const result = await handler.execute(query);

    expect(result).toEqual(payload);
  });

  it('returns valid sign-up payload', async () => {
    const payload = { action: 'sign-up', username: 'zezima', language: 'en' };
    const query = new VerifyAuthCodeQuery('zezima@runebingo.com', 'signup');

    await redisService.set('auth:zezima@runebingo.com:signup', JSON.stringify(payload));

    const result = await handler.execute(query);

    expect(result).toEqual(payload);
  });
});
