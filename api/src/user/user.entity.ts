import { createHash } from 'crypto';

import { Column, Entity, OneToMany } from 'typeorm';

import { StrongEntityParanoid } from '@/db/base.entity';
import { Session } from '@/session/session.entity';

import type { Roles } from '../auth/roles/roles.constants';

@Entity()
export class User extends StrongEntityParanoid {
  @Column({ type: 'timestamptz', nullable: true })
  disabledAt: Date | null = null;

  @Column({ type: 'int', nullable: true })
  disabledBy: number | null = null;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ unique: true, length: 255 })
  emailNormalized: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ unique: true, length: 25 })
  username: string;

  @Column({ unique: true, length: 25 })
  usernameNormalized: string;

  @Column({ type: 'char', length: 64, nullable: true })
  gravatarHash: string | null = null;

  @Column({ default: 'en' })
  language: string;

  @Column({ type: 'varchar', default: 'user' })
  role: Roles;

  @OneToMany(() => Session, (session: Session) => session.user)
  sessions: Promise<Session[]>;

  get isDisabled() {
    return this.disabledAt !== null;
  }

  static generateGravatarHash(email: string) {
    return createHash('sha256').update(email).digest('hex');
  }

  static normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  static normalizeUsername(username: string) {
    return username.trim().toLowerCase();
  }
}
