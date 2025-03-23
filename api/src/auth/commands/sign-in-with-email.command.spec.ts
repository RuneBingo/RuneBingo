import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { RedisService } from '@/redis/redis.service';
import { User } from '@/user/user.entity';

import { SignInWithEmailCommand } from './sign-in-with-email.command';
import { SignInWithEmailHandler } from './sign-in-with-email.handler';
import { RedisServiceMock } from '../../../test/mocks/redis.service.mock';

describe('SignInWithEmailHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let redisService: RedisServiceMock;
  let handler: SignInWithEmailHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([User])],
      providers: [
        SeedingService,
        SignInWithEmailHandler,
        {
          provide: RedisService,
          useValue: new RedisServiceMock(),
        },
      ],
    }).compile();

    handler = module.get(SignInWithEmailHandler);
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

  it('throws NotFoundException if user is not found', async () => {
    const command = new SignInWithEmailCommand('nonexistent@example.com');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if user is disabled', async () => {
    const command = new SignInWithEmailCommand('disabled.user@runebingo.com');

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('generates a sign-in code and saves it in Redis', async () => {
    const command = new SignInWithEmailCommand('zezima@runebingo.com');

    const { code } = await handler.execute(command);
    const value = await redisService.get(`auth:zezima@runebingo.com:${code}`);

    expect(value).toBeDefined();
    expect(JSON.parse(value!)).toEqual({ action: 'sign-in' });
  });
});
