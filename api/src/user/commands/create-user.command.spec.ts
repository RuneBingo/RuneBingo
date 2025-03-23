import { ConflictException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Roles } from '@/auth/roles/roles.constants';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';

import { CreateUserHandler } from './create-user.handler';
import { User } from '../user.entity';
import { CreateUserCommand } from './create-user.command';
import { UserCreatedEvent } from '../events/user-created.event';

describe('CreateUserHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: CreateUserHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([User])],
      providers: [
        CreateUserHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(CreateUserHandler);
    eventBus = module.get(EventBus);
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

  it('throws ConflictException if email is already in use', async () => {
    const command = new CreateUserCommand({
      email: 'zezima@runebingo.com',
      username: 'new-zezima',
      language: 'en',
      requester: null,
    });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });

  it('throws ConflictException if username is already in use', async () => {
    const command = new CreateUserCommand({
      email: 'new-user@runebingo.com',
      username: 'Zezima',
      language: 'en',
      requester: null,
    });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });

  it('creates a new user and emits a UserCreatedEvent', async () => {
    const command = new CreateUserCommand({
      email: 'New-User@runebingo.com',
      username: 'New User',
      language: 'en',
      requester: null,
    });

    const user = await handler.execute(command);

    expect(user).toBeDefined();
    expect(user.email).toBe('New-User@runebingo.com');
    expect(user.emailNormalized).toBe(User.normalizeEmail('New-User@runebingo.com'));
    expect(user.username).toBe('New User');
    expect(user.usernameNormalized).toBe(User.normalizeUsername('New User'));
    expect(user.language).toBe('en');
    expect(user.isDisabled).toBe(false);
    expect(user.isDeleted).toBe(false);
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
    expect(user.gravatarHash).toBe(User.generateGravatarHash(user.emailNormalized));
    expect(user.role).toBe(Roles.User);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new UserCreatedEvent({
        userId: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        username: user.username,
        language: user.language,
      }),
    );
  });
});
