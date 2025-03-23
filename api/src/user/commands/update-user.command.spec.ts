import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Roles } from '@/auth/roles/roles.constants';
import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';

import { UpdateUserHandler } from './update-user.handler';
import { User } from '../user.entity';
import { UpdateUserCommand } from './update-user.command';
import { UserUpdatedEvent } from '../events/user-updated.event';

describe('UpdateUserHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: UpdateUserHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([User])],
      providers: [
        UpdateUserHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(UpdateUserHandler);
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

  it('throws NotFoundException if the user is not found', async () => {
    const requester = seedingService.getEntity(User, 'zezima');

    const command = new UpdateUserCommand({
      username: 'non-existent-user',
      requester,
      updates: {
        username: 'New Username',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the requester is not a moderator and tries to update another user', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');

    const command = new UpdateUserCommand({
      username: 'zezima',
      requester,
      updates: {
        username: 'New Username',
      },
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if the requester is not an admin and tries to update another user role', async () => {
    const requester = seedingService.getEntity(User, 'zezima');

    const command = new UpdateUserCommand({
      username: 'b0aty',
      requester,
      updates: { role: Roles.Admin },
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('throws ConflictException if the new username is already in use', async () => {
    const requester = seedingService.getEntity(User, 'zezima');

    const command = new UpdateUserCommand({
      username: 'b0aty',
      requester,
      updates: { username: 'raph' },
    });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });

  it('updates user successfully and emits UserUpdatedEvent', async () => {
    const requester = seedingService.getEntity(User, 'char0o');

    const command = new UpdateUserCommand({
      username: 'b0aty',
      requester,
      updates: { username: 'New Username', language: 'fr', role: Roles.Moderator },
    });

    const user = await handler.execute(command);

    expect(user).toBeDefined();
    expect(user.username).toBe('New Username');
    expect(user.language).toBe('fr');
    expect(user.role).toBe(Roles.Moderator);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      new UserUpdatedEvent({
        userId: user.id,
        requesterId: requester.id,
        updates: command.updates,
      }),
    );
  });
});
