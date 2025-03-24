/* eslint-disable @typescript-eslint/unbound-method */
import { ForbiddenException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configModule } from '@/config';
import { dbModule } from '@/db';
import { SeedingService } from '@/db/seeding/seeding.service';
import { i18nModule } from '@/i18n';

import { SignOutSessionByUuidCommand } from './sign-out-session-by-uuid.command';
import { SignOutSessionByUuidHandler } from './sign-out-session-by-uuid.handler';
import { User } from '../../user/user.entity';
import { SessionSignedOutEvent } from '../events/session-signed-out.event';
import { Session } from '../session.entity';

describe('SignOutSessionByUuidHandler', () => {
  let module: TestingModule;
  let seedingService: SeedingService;
  let eventBus: jest.Mocked<EventBus>;
  let handler: SignOutSessionByUuidHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [configModule, dbModule, i18nModule, TypeOrmModule.forFeature([Session])],
      providers: [
        SignOutSessionByUuidHandler,
        SeedingService,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(SignOutSessionByUuidHandler);
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

  it('throws ForbiddenException if the requester is not and admin and not the same as the session user', async () => {
    const requester = seedingService.getEntity(User, 'b0aty');
    const session = seedingService.getEntity(Session, 'zezima_active_session_01');

    const command = new SignOutSessionByUuidCommand({ uuid: session.uuid, requester });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('signs out session and emits SessionSignedOutEvent', async () => {
    const session = seedingService.getEntity(Session, 'zezima_active_session_01');

    const command = new SignOutSessionByUuidCommand({ uuid: session.uuid, requester: 'self' });

    const result = await handler.execute(command);

    expect(result?.signedOutAt).not.toBeNull();
    expect(eventBus.publish).toHaveBeenCalledWith(
      new SessionSignedOutEvent({ sessionId: session.id, requesterId: session.userId }),
    );
  });

  it('returns null and does not emit event if session is not found', async () => {
    const command = new SignOutSessionByUuidCommand({
      uuid: '00000000-0000-0000-0000-000000000000',
      requester: 'self',
    });

    const result = await handler.execute(command);

    expect(result).toBeNull();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('returns null and does not emit event if session is already signed out', async () => {
    const session = seedingService.getEntity(Session, 'zezima_signed_out_session_01');

    const command = new SignOutSessionByUuidCommand({ uuid: session.uuid, requester: 'self' });

    const result = await handler.execute(command);

    expect(result).toBeNull();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
