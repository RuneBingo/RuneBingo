import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SignOutSessionByUuidCommand, type SignOutSessionByUuidResult } from './sign-out-session-by-uuid.command';
import { SessionSignedOutEvent } from '../events/session-signed-out.event';
import { Session } from '../session.entity';

@CommandHandler(SignOutSessionByUuidCommand)
export class SignOutSessionByUuidHandler {
  constructor(
    private readonly eventBus: EventBus,
    @InjectRepository(Session) private readonly sessionRepository: Repository<Session>,
  ) {}

  async execute(command: SignOutSessionByUuidCommand): Promise<SignOutSessionByUuidResult> {
    const { uuid, requester } = command;

    let session = await this.sessionRepository.findOneBy({ uuid });
    if (!session || session.isSignedOut) {
      return null;
    }

    const requesterUser = requester === 'self' ? await session.user : requester;

    session.signOut();
    session.updatedBy = requesterUser.id;

    session = await this.sessionRepository.save(session);

    await this.eventBus.publish(new SessionSignedOutEvent({ sessionId: session.id, requesterId: requesterUser.id }));

    return session;
  }
}
