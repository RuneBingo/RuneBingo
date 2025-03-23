import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';

import { User } from '../user.entity';
import { SearchUsersHandler } from './search-users.handler';
import { SearchUsersQuery, type SearchUsersResult } from './search-users.query';

describe('SearchUsersHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let handler: SearchUsersHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([User])],
      providers: [SearchUsersHandler, SeedingService],
    }).compile();

    handler = module.get(SearchUsersHandler);
    seedingService = module.get(SeedingService);

    await seedingService.initialize();
  });

  afterAll(async () => {
    await seedingService.clear();
    return module.close();
  });

  it('applies search filter correctly', async () => {
    const requester = seedingService.getEntity(User, 'char0o');
    const expectedUsers = [seedingService.getEntity(User, 'b0aty')];

    const query = new SearchUsersQuery({
      requester,
      search: '0aty',
    });

    const result = await handler.execute(query);

    assertExpectedUsers(result, expectedUsers);
  });

  it('ignores status filter if the requester is not a moderator', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const expectedUsers = [seedingService.getEntity(User, 'b0aty')];

    const query = new SearchUsersQuery({
      requester,
      status: 'disabled',
    });

    const result = await handler.execute(query);

    assertExpectedUsers(result, expectedUsers);
  });

  it('applies status filter correctly if the requester is a moderator', async () => {
    const requester = seedingService.getEntity(User, 'zezima');
    const expectedUsers = [seedingService.getEntity(User, 'disabled_user')];

    const query = new SearchUsersQuery({
      requester,
      status: 'disabled',
    });

    const result = await handler.execute(query);

    assertExpectedUsers(result, expectedUsers);
  });
});

const assertExpectedUsers = (result: SearchUsersResult, expectedUsers: User[]) => {
  result.items.forEach((item, i) => {
    expect(expectedUsers[i]).not.toBeNull();
    expect(item.id).toBe(expectedUsers[i].id);
  });
};
