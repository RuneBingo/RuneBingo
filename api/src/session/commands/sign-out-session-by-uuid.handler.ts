import { ForbiddenException } from '@nestjs/common';
import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import type { I18nTranslations } from '@/i18n/types';

import { SignOutSessionByUuidCommand, type SignOutSessionByUuidResult } from './sign-out-session-by-uuid.command';
import { SessionSignedOutEvent } from '../events/session-signed-out.event';
import { Session } from '../session.entity';
import { SessionPolicies } from '../session.policies';

@CommandHandler(SignOutSessionByUuidCommand)
export class SignOutSessionByUuidHandler {
  constructor(
    private readonly eventBus: EventBus,
    private readonly i18nService: I18nService<I18nTranslations>,
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

    if (!new SessionPolicies(requesterUser).canSignOut(session)) {
      throw new ForbiddenException(this.i18nService.t('session.signOutSessionByUuid.forbidden'));
    }

    session = await this.sessionRepository.save(session);

    await this.eventBus.publish(new SessionSignedOutEvent({ sessionId: session.id, requesterId: requesterUser.id }));

    return session;
  }
}
