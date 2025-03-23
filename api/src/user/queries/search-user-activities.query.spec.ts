import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Activity } from '@/activity/activity.entity';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';

import { User } from '../user.entity';
import { SearchUserActivitiesHandler } from './search-user-activities.handler';
import { SearchUserActivitiesQuery } from './search-user-activities.query';

describe('SearchUserActivitiesHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let handler: SearchUserActivitiesHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Activity, User])],
      providers: [SearchUserActivitiesHandler, SeedingService],
    }).compile();

    handler = module.get(SearchUserActivitiesHandler);
    seedingService = module.get(SeedingService);

    await seedingService.initialize();
  });

  afterAll(async () => {
    await seedingService.clear();
    return module.close();
  });

  it('throws NotFoundException if the user does not exist', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const query = new SearchUserActivitiesQuery({
      username: 'non-existent-user',
      requester,
    });

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the user is not the same as the requester and is not an admin', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const query = new SearchUserActivitiesQuery({
      username: 'char0o',
      requester,
    });

    await expect(handler.execute(query)).rejects.toThrow(ForbiddenException);
  });

  it('returns the user activities if the user is the same as the requester', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const query = new SearchUserActivitiesQuery({
      username: 'b0aty',
      requester,
    });

    await expect(handler.execute(query)).resolves.not.toThrow();
  });

  it('returns the user activities if the user is an admin', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const query = new SearchUserActivitiesQuery({
      username: 'b0aty',
      requester,
    });

    await expect(handler.execute(query)).resolves.not.toThrow();
  });
});
