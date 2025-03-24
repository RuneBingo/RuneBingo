import { ForbiddenException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';
import { Session } from '@/session/session.entity';
import { User } from '@/user/user.entity';

import { CreateSessionForUserCommand } from './create-session-for-user.command';
import { CreateSessionForUserHandler } from './create-session-for-user.handler';
import { SessionCreatedEvent } from '../events/session-created.event';

describe('CreateSessionForUserHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: CreateSessionForUserHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Session])],
      providers: [
        CreateSessionForUserHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(CreateSessionForUserHandler);
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

  it('throws ForbiddenException if user is deleted', async () => {
    const user = seedingService.getEntity(User, 'deleted_user');

    const command = new CreateSessionForUserCommand({
      requester: user,
      user,
      method: 'email',
      sessionId: 'session-uuid',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if user is disabled', async () => {
    const user = seedingService.getEntity(User, 'disabled_user');

    const command = new CreateSessionForUserCommand({
      requester: user,
      user,
      method: 'email',
      sessionId: 'session-uuid',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('creates a session successfully and publishes a SessionCreatedEvent', async () => {
    const user = seedingService.getEntity(User, 'char0o');

    const command = new CreateSessionForUserCommand({
      requester: user,
      user,
      method: 'email',
      sessionId: 'session-uuid',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    const result = await handler.execute(command);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new SessionCreatedEvent({ sessionId: result.id, requesterId: user.id }),
    );
  });
});
