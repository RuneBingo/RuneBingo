import { ConflictException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { RedisService } from '@/redis/redis.service';
import { User } from '@/user/user.entity';

import { SignUpWithEmailCommand } from './sign-up-with-email.command';
import { SignUpWithEmailHandler } from './sign-up-with-email.handler';
import { RedisServiceMock } from '../../../test/mocks/redis.service.mock';

describe('SignUpWithEmailHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let redisService: RedisServiceMock;
  let handler: SignUpWithEmailHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([User])],
      providers: [
        SeedingService,
        SignUpWithEmailHandler,
        {
          provide: RedisService,
          useValue: new RedisServiceMock(),
        },
      ],
    }).compile();

    handler = module.get(SignUpWithEmailHandler);
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

  it('throws ConflictException if email is already in use', async () => {
    const command = new SignUpWithEmailCommand('zezima@runebingo.com', 'Zezima', 'en');

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });

  it('throws ConflictException if username is already in use', async () => {
    const command = new SignUpWithEmailCommand('new-user@runebingo.com', 'Zezima', 'en');

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });

  it('generates a sign-up code and saves it in Redis', async () => {
    const command = new SignUpWithEmailCommand('new-user@runebingo.com', 'New User', 'en');

    const { code } = await handler.execute(command);
    const value = await redisService.get(`auth:new-user@runebingo.com:${code}`);

    expect(value).toBeDefined();
    expect(JSON.parse(value!)).toEqual({ action: 'sign-up', username: 'New User', language: 'en' });
  });
});
