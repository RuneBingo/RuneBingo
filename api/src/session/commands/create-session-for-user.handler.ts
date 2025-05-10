import { ForbiddenException } from '@nestjs/common';
import { CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { addWeeks } from 'date-fns';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { UAParser } from 'ua-parser-js';

import type { I18nTranslations } from '@/i18n/types';
import { Session } from '@/session/session.entity';

import { CreateSessionForUserCommand, CreateSessionForUserResult } from './create-session-for-user.command';
import { SessionCreatedEvent } from '../events/session-created.event';
import { SessionPolicies } from '../session.policies';

type IPInfoResponse = {
  city: string;
  region: string;
  country: string;
};

@CommandHandler(CreateSessionForUserCommand)
export class CreateSessionForUserHandler {
  constructor(
    private readonly eventBus: EventBus,
    private readonly i18nService: I18nService<I18nTranslations>,
    @InjectRepository(Session) private readonly sessionRepository: Repository<Session>,
  ) {}

  async execute(command: CreateSessionForUserCommand): Promise<CreateSessionForUserResult> {
    const { user, method, sessionId, ip, userAgent } = command;

    const { deviceType, os, browser } = this.getUserAgentInfo(userAgent);
    const location = await this.getLocationFromIP(ip);

    let session = new Session();
    session.createdById = user.id;
    session.userId = user.id;
    session.user = Promise.resolve(user);
    session.sessionID = sessionId;
    session.method = method;
    session.ipAddress = ip;
    session.userAgent = userAgent;
    session.deviceType = deviceType;
    session.os = os;
    session.browser = browser;
    session.location = location;
    session.lastSeenAt = new Date();
    session.expiresAt = addWeeks(new Date(), 2);

    if (!new SessionPolicies(command.requester).canCreate(session, user)) {
      throw new ForbiddenException(this.i18nService.t('session.createSessionForUser.forbidden'));
    }

    session = await this.sessionRepository.save(session);

    await this.eventBus.publish(new SessionCreatedEvent({ sessionId: session.id, requesterId: user.id }));

    return session;
  }

  private getUserAgentInfo(userAgent: string): Pick<Session, 'deviceType' | 'os' | 'browser'> {
    const parser = new UAParser(userAgent);
    const deviceType = parser.getDevice().type || 'desktop';
    const os = parser.getOS().name || 'unknown';
    const browser = parser.getBrowser().name || 'unknown';

    return { deviceType, os, browser };
  }

  private async getLocationFromIP(ip: string) {
    try {
      const response = await fetch(`https://ipinfo.io/${ip}/json`);
      if (!response.ok) {
        return 'unknown';
      }

      const data = (await response.json()) as IPInfoResponse;
      const result = [data.city, data.region, data.country].filter(Boolean).join(', ');

      return result || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}
