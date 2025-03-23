import Joi from 'joi';

import { Session } from '@/session/session.entity';
import { User } from '@/user/user.entity';

import { Seeder } from './seeder';

type SessionSeed = {
  user: string;
  session_id: string;
  method: string;
  ip_address: string;
  user_agent: string;
  device_type: string;
  os: string;
  browser: string;
  location: string;
  expires_at: Date;
  last_seen_at: Date;
  signed_out_at?: Date;
};

const sessionSeedSchema = Joi.object<Record<string, SessionSeed>>().pattern(
  Joi.string(),
  Joi.object({
    user: Joi.string().required(),
    session_id: Joi.string().required(),
    method: Joi.string().required(),
    ip_address: Joi.string().required(),
    user_agent: Joi.string().required(),
    device_type: Joi.string().required(),
    os: Joi.string().required(),
    browser: Joi.string().required(),
    location: Joi.string().required(),
    expires_at: Joi.date().required(),
    last_seen_at: Joi.date().required(),
    signed_out_at: Joi.date().optional(),
  }),
);

export class SessionSeeder extends Seeder<Session, SessionSeed> {
  entityName = Session.name;
  identifierColumn = 'sessionID' as keyof Session;
  schema = sessionSeedSchema;

  protected deserialize(seed: SessionSeed): Session {
    const user = this.seedingService.getEntity(User, seed.user);

    const session = new Session();
    session.userId = user.id;
    session.user = Promise.resolve(user);
    session.sessionID = seed.session_id;
    session.method = seed.method;
    session.ipAddress = seed.ip_address;
    session.userAgent = seed.user_agent;
    session.deviceType = seed.device_type;
    session.os = seed.os;
    session.browser = seed.browser;
    session.location = seed.location;
    session.expiresAt = seed.expires_at;
    session.lastSeenAt = seed.last_seen_at;
    session.signedOutAt = seed.signed_out_at ?? null;

    return session;
  }

  protected getIdentifier(entity: Session) {
    return entity.sessionID;
  }
}
