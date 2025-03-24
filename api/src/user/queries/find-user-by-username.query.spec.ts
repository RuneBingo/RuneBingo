import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';

import { User } from '../user.entity';
import { FindUserByUsernameHandler } from './find-user-by-username.handler';
import { FindUserByUsernameQuery } from './find-user-by-username.query';

describe('FindUserByUsernameHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let handler: FindUserByUsernameHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([User])],
      providers: [FindUserByUsernameHandler, SeedingService],
    }).compile();

    handler = module.get(FindUserByUsernameHandler);
    seedingService = module.get(SeedingService);
  });

  beforeEach(async () => {
    await seedingService.initialize();
  });

  afterEach(async () => {
    await seedingService.clear();
  });

  afterAll(() => {
    return module.close();
  });

  it('throws NotFoundException if the user does not exist', async () => {
    const requester = seedingService.getEntity(User, 'char0o');

    const query = new FindUserByUsernameQuery({
      username: 'non-existent-user',
      requester,
    });

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException if the user is disabled and the requester is not a moderator', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');

    const query = new FindUserByUsernameQuery({
      username: 'disabled-user',
      requester,
    });

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('returns the user if it exists and is disabled but the requester is a moderator', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const expectedUser = seedingService.getEntity(User, 'disabled_user');

    const query = new FindUserByUsernameQuery({
      username: 'disabled user',
      requester,
    });

    const user = await handler.execute(query);

    expect(user).toBeDefined();
    expect(user.id).toBe(expectedUser.id);
  });

  it('returns the user if it exists and is not disabled', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedUser = seedingService.getEntity(User, 'b0aty');

    const query = new FindUserByUsernameQuery({
      username: 'b0aty',
      requester,
    });

    const user = await handler.execute(query);

    expect(user).toBeDefined();
    expect(user.id).toBe(expectedUser.id);
  });
});
